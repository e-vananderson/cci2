// Co-written by Stanton Martin and Evan Anderson

package org.ORNL.fieldtrip2

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import kotlinx.android.synthetic.main.activity_menu.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

// this is the screen with the routes dropdown menu
class MenuActivity: AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_menu)

        // go to start trip screen if "create new trip" button pressed
        new_trip_btn.setOnClickListener {
            val myIntent = Intent(this, StartTripActivity::class.java)
            this.startActivity(myIntent)
        }

        // get routes array from main activity
        val arr = intent.getStringArrayListExtra("routes") as ArrayList<String>
        val spinner: Spinner = findViewById(R.id.routeSpinner)
        // Create an ArrayAdapter using the routes array and a default spinner layout
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, arr)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinner.adapter = adapter

        /* when "get my route" button is pressed,
         * get points from database for selected
         * route, then launch maps activity,
         * passing array of points (currently
         * just grabs whatever points are
         * presently stored in routes_android
         * table -- need to modify so that
         * points grabbed correspond to route
         * selected)
         */
        start_btn.setOnClickListener() {
            val coordinatesScope = CoroutineScope(Dispatchers.IO)
            var arr: ArrayList<String>? = null
            coordinatesScope.launch {
                arr = httpGetRoutePoints("body")
            }
            while (arr == null) {}
            val mapsIntent = Intent(this, MapsActivity::class.java)
            mapsIntent.putStringArrayListExtra("points", arr)
            this.startActivity(mapsIntent)
            this.startActivity(mapsIntent)
        }
    }

    private suspend fun httpGetRoutePoints(postBody: String): ArrayList<String> {
        var str: String?
        withContext(Dispatchers.IO) {
            val client = OkHttpClient()

            val request = Request.Builder()
                .url("http://10.0.2.2:80/getRoutePoints.php") // http://10.0.2.2:[port]/path-to-your-getUserId.php
                .post(postBody.toRequestBody("application/x-www-form-urlencoded; charset=UTF-8".toMediaTypeOrNull()))
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) throw IOException("Unexpected code $response")

                str = response.body!!.string()
                Log.d("tag", "!!!!!! Points = $str !!!!!!")
            }
        }
        var arr = ArrayList<String>()
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
}