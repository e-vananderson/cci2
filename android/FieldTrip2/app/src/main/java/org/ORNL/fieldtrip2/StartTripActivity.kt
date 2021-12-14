package org.ORNL.fieldtrip2

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.view.View
import android.view.Window
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import kotlinx.android.synthetic.main.activity_main.*

class StartTripActivity : Activity() {

    private var takePictureButton: Button? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        setContentView(R.layout.activity_main)

        takePictureButton = findViewById<View>(R.id.btn_start) as Button

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            takePictureButton!!.isEnabled = false
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA, Manifest.permission.WRITE_EXTERNAL_STORAGE), 0)
        }


        btn_start.setOnClickListener {
            val intent = Intent(this, CameraActivity::class.java)
            val tripName = findViewById<EditText>(R.id.trip_name)
            val newTrip = tripName.text.toString()
/*            Toast.makeText(this, newTrip, Toast.LENGTH_SHORT)
                .show()*/
            if(newTrip.isNotEmpty()){
                intent.putExtra("Name", newTrip)
                startActivity(intent)
                this.finish()
            }else{
                Toast.makeText(this,"Please enter a name", Toast.LENGTH_SHORT)
                    .show()
            }
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        if (requestCode == 0) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
                && grantResults[1] == PackageManager.PERMISSION_GRANTED) {
                takePictureButton!!.isEnabled = true
            }
        }
    }
}
