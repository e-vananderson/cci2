package org.ORNL.fieldtrip2

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
// import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.FileProvider
import android.util.Log
import android.view.View
import android.view.Window
import android.widget.ImageView
import java.io.*
import java.text.SimpleDateFormat
import java.util.*
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

class CameraActivity : Activity(){

    private var imageView: ImageView? = null
    private var file: Uri? = null
    private val picList= mutableListOf<String>()
    private val outputMediaFile: File?
        get() {
            val newTrip = intent.getStringExtra("Name")
            val mediaStorageDir = File(
                /*Environment.getExternalStoragePublicDirectory(
                    Environment.DIRECTORY_PICTURES)*/ getExternalFilesDir(null), "CBIFieldTrip")

            val mediaStorageSubDir = File(mediaStorageDir, newTrip.toString())

            if (!mediaStorageDir.exists()) {
                if (!mediaStorageDir.mkdirs()) {
                    Log.e("CBIFieldTrip", "failed to create directory")
                    return null
                }
            }

            if (!mediaStorageSubDir.exists()) {
                if (!mediaStorageSubDir.mkdirs()) {
                    Log.e(newTrip, "failed to create directory")
                    return null
                }
            }

            val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
            return File(mediaStorageSubDir.path + File.separator +
                    "IMG_" + timeStamp + ".jpg")


        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        setContentView(R.layout.activity_camera)

        imageView = findViewById<View>(R.id.img_view) as ImageView

    }


    fun takePicture(view: View) {
        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)


        file = FileProvider.getUriForFile(this@CameraActivity, "org.ORNL.fieldtrip2.provider",
            outputMediaFile!!)


        /*file=Uri.fromFile(getOutputMediaFile());*/
        intent.putExtra(MediaStore.EXTRA_OUTPUT, file)

        startActivityForResult(intent, 100)

        picList.add(outputMediaFile.toString())

/*        Toast.makeText(this@CameraActivity, picList.toString(),
            Toast.LENGTH_SHORT).show()*/
    }

    fun endTrip(view: View){
        val newTrip = intent.getStringExtra("Name")
        val mediaStorageDir = File(
            /*Environment.getExternalStoragePublicDirectory(
                Environment.DIRECTORY_PICTURES)*/ getExternalFilesDir(null), "CBIFieldTrip")
        val mediaStorageSubDir = File(mediaStorageDir, newTrip.toString())
        val mediaStorageZip = "$mediaStorageSubDir.zip"
        val intent = Intent(this, UploadActivity::class.java)

        val out = ZipOutputStream(BufferedOutputStream(FileOutputStream(mediaStorageZip)))
        for (file in picList) {
            val fi = FileInputStream(file)
            val origin = BufferedInputStream(fi)
            val entry = ZipEntry(file.substring(file.lastIndexOf("/")))
            out.putNextEntry(entry)
            origin.copyTo(out, 1024)
            origin.close()
        }
        out.close()

/*        Toast.makeText(this@CameraActivity, mediaStorageZip.toString(),
            Toast.LENGTH_SHORT).show()
*/
        startActivity(intent)
        this.finish()
    }


    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == 100) {
            if (resultCode == RESULT_OK) {
                imageView!!.setImageURI(file)
            }
        }
    }
}
