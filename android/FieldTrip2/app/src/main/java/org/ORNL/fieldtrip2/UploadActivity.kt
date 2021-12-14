package org.ORNL.fieldtrip2

import android.app.Activity
import android.app.ProgressDialog
import android.widget.ProgressBar
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import androidx.core.app.ActivityCompat
import android.util.Log
import android.widget.Toast
import com.ipaulpro.afilechooser.utils.FileUtils
import kotlinx.android.synthetic.main.activity_upload.*
import okhttp3.MultipartBody
import org.ORNL.fieldtrip2.Remote.IUploadAPI
import org.ORNL.fieldtrip2.Remote.RetroFitClient
import org.ORNL.fieldtrip2.Utils.ProgressRequestBody
import retrofit2.Call
import retrofit2.Response

class UploadActivity : Activity(), ProgressRequestBody.UploadCallbacks {
    override fun onProgressUpdate(percentage: Int) {
        dialog.progress = percentage
    }


    val BASE_URL = "http://labkey.ornl.gov"

    val apiUpload: IUploadAPI
        get() = RetroFitClient.getClient(BASE_URL).create(IUploadAPI::class.java)

    private val PERMISSION_REQUEST: Int = 1000
    private val PICK_IMAGE_REQUEST: Int = 1001

    lateinit var mService:IUploadAPI

    private var selectedFileUri: Uri?=null

    lateinit var dialog: ProgressDialog

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_upload)

        //Request runtime permission
        if(ActivityCompat.checkSelfPermission(this, android.Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED)
            ActivityCompat.requestPermissions(this, arrayOf(android.Manifest.permission.READ_EXTERNAL_STORAGE), PERMISSION_REQUEST)

        //Service
        mService = apiUpload

        upload_view.setOnClickListener{chooseImage()}

        btn_upload.setOnClickListener{uploadFile()}
    }

    private fun uploadFile() = if(selectedFileUri != null)
    {
        dialog = ProgressDialog(this@UploadActivity)
        dialog.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL)
        dialog.setMessage("Uploading...")
        dialog.isIndeterminate = false
        dialog.setCancelable(false)
        dialog.max = 100
        dialog.show()

        val file = FileUtils.getFile(this,selectedFileUri)
        val requestFile = ProgressRequestBody(file,this)
        val body = MultipartBody.Part.createFormData("uploaded_file",file.name,requestFile)

        Thread {

            mService.uploadFile(body)
                .enqueue(object : retrofit2.Callback<String> {
                    override fun onFailure(call: Call<String>, t: Throwable) {
                        dialog.dismiss()
                        Toast.makeText(this@UploadActivity, t.message, Toast.LENGTH_SHORT)
                            .show()
                    }

                    override fun onResponse(call: Call<String>, response: Response<String>) {
                        dialog.dismiss()

                        Toast.makeText(this@UploadActivity, "Uploaded", Toast.LENGTH_SHORT)
                            .show()
                        Log.e("Server Response", "Dude: " + response.body().toString())

                    }


                })

        }.start()
    }
    else{
        Toast.makeText(this,"Please choose file", Toast.LENGTH_SHORT)
            .show()
    }

    private fun chooseImage() {
        val getContentIntent = FileUtils.createGetContentIntent()
        val intent = Intent.createChooser(getContentIntent,"Select a file")
        startActivityForResult(intent,PICK_IMAGE_REQUEST)
    }


    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if(resultCode == RESULT_OK)
        {
            if(requestCode == PICK_IMAGE_REQUEST)
            {
                if(data != null)
                {
                    selectedFileUri = data.data
                    if(selectedFileUri != null && !(selectedFileUri!!.path!!.isEmpty()))
                        upload_view.setImageURI(selectedFileUri)
                }
            }
        }
    }


    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when(requestCode)
        {
            PERMISSION_REQUEST -> {
                if(grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED)
                    Toast.makeText(this,"Granted", Toast.LENGTH_SHORT).show()
                else
                    Toast.makeText(this,"Denied", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
