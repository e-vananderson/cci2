// Co-written by Stanton Martin and Evan Anderson

package org.ORNL.fieldtrip2

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializer
import kotlinx.android.synthetic.main.activity_signin.*
import kotlinx.coroutines.*
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import org.json.JSONArray
import java.io.IOException
import java.io.StringReader

// login page with "sign in with Google" button
class MainActivity : AppCompatActivity() {

    lateinit var mGoogleSignInClient: GoogleSignInClient
    private val RC_SIGN_IN = 9001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_signin)

        val gso =
            GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken("519460156419-spt5rnog2pg0s8c3u3bbk9c37qk556l2.apps.googleusercontent.com") // google cloud credentials ("web client")
                .requestEmail()
                .build()

        mGoogleSignInClient = GoogleSignIn.getClient(this, gso)

        google_login_btn.setOnClickListener {
            signIn()
        }
    }

    private fun signIn() {
        val signInIntent = mGoogleSignInClient.signInIntent
        startActivityForResult(
            signInIntent, RC_SIGN_IN
        )
    }

    private fun signOut() {
        mGoogleSignInClient.signOut()
            .addOnCompleteListener(this) {
                // Update UI here
            }
    }

    private fun revokeAccess() {
        mGoogleSignInClient.revokeAccess()
            .addOnCompleteListener(this) {
                // Update UI here
            }
    }

    // authenticates user w/ database
    private suspend fun httpAuthRequest(postBody: String): String? {
        var str: String? = "User does not exist"
        withContext(Dispatchers.IO) {
            val client = OkHttpClient()

            val request = Request.Builder()
                .url("http://10.0.2.2:80/authorize.php") // http://10.0.2.2:[port]/path-to-your-authorize.php
                .post(postBody.toRequestBody("application/x-www-form-urlencoded; charset=UTF-8".toMediaTypeOrNull()))
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) throw IOException("Unexpected code $response")

                str = response.body!!.string()
                Log.d("tag", "!!!!!! str = $str !!!!!!")
            }
        }
        return str
    }

    // gets routes for existing user
    private suspend fun httpGetUserRoutes(postBody: String): ArrayList<String> {
        var str: String? = null
        withContext(Dispatchers.IO) {
            val client = OkHttpClient()

            val request = Request.Builder()
                .url("http://10.0.2.2:80/getUserRoutes.php") // http://10.0.2.2:[port]/path-to-your-getUserId.php
                .post(postBody.toRequestBody("application/x-www-form-urlencoded; charset=UTF-8".toMediaTypeOrNull()))
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) throw IOException("Unexpected code $response")

                str = response.body!!.string()
                Log.d("tag", "!!!!!! User Routes = $str !!!!!!")
            }
        }
        val arr = ArrayList<String>()
        if (str != null) {
            var i = 2

            while (str!![i+1] != ']') {
                var tmp = ""

                while (str!![i] != '\"')
                    tmp += str!![i++]

                arr.add(tmp)
                if (str!![i+1] != ']')
                    i += 3
            }
        }
        Log.d("tag", "!!!!!! arr = $arr !!!!!!")

        for((i, route) in arr.withIndex()) {
            Log.d("tag","!!!!!! arr[$i] = $route !!!!!!")
        }

        return arr
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == RC_SIGN_IN) {
            val task =
                GoogleSignIn.getSignedInAccountFromIntent(data)
            handleSignInResult(task)
        }
    }

    // defines alternate behavior for new and existing users
    private fun handleSignInResult(completedTask: Task<GoogleSignInAccount>) {
        try {
            val account = completedTask.getResult(
                ApiException::class.java
            )

            val googleId = account?.id ?: ""
            Log.i("Google ID",googleId)

            val googleIdToken = account?.idToken ?: ""
            Log.i("Google ID Token", googleIdToken)

            val authScope = CoroutineScope(Dispatchers.IO)

            var response: String? = null
            authScope.launch {
                response = httpAuthRequest("GoogleToken=$googleIdToken")
            }

            while(response == null) {}
            Log.d("tag", "!!!!!! response = $response !!!!!!")

            // if user not present in database, skip menu screen and prompt for new trip name
            // TODO: add behavior for existing user with no routes
            if (response == "User does not exist") {
                val myIntent = Intent(this, StartTripActivity::class.java)
                this.startActivity(myIntent)
            } else { // get routes and launch menu screen if user is in database
                val userRoutesScope = CoroutineScope(Dispatchers.IO)

                var routesArray = ArrayList<String>()
                userRoutesScope.launch {
                    routesArray = httpGetUserRoutes(googleId)
                }

                while(routesArray.size == 0) {}

                val myIntent = Intent(this, MenuActivity::class.java)
                myIntent.putStringArrayListExtra("routes", routesArray)
                this.startActivity(myIntent)
            }


        } catch (e: ApiException) {
            // Sign in was unsuccessful
            Log.e(
                "failed code=", e.statusCode.toString()
            )
        }
    }
}
