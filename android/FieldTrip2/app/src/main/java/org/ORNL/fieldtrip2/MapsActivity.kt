// Co-written by Stanton Martin and Evan Anderson

package org.ORNL.fieldtrip2

import android.Manifest
import android.content.pm.PackageManager
import android.location.Criteria
import android.location.Criteria.ACCURACY_HIGH
import android.location.Location
import android.location.LocationManager
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.google.android.gms.maps.model.PolylineOptions
import org.ORNL.fieldtrip2.databinding.ActivityMapsBinding
import java.util.*
import kotlin.collections.ArrayList
import kotlin.concurrent.schedule
import kotlin.concurrent.scheduleAtFixedRate
import kotlin.math.pow
import kotlin.math.round

class MapsActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var mMap: GoogleMap
    private lateinit var binding: ActivityMapsBinding

    private val PERMISSIONS_REQUEST_ACCESS_FINE_LOCATION = 1
    private var locationPermissionGranted = false
    private var lastKnownLocation: Location? = null
    private lateinit var fusedLocationProviderClient: FusedLocationProviderClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMapsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Construct a FusedLocationProviderClient.
        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this)

        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)
    }

    private fun getLocationPermission() {
        /*
         * Request location permission, so that we can get the location of the
         * device. The result of the permission request is handled by a callback,
         * onRequestPermissionsResult.
         */
        if (ContextCompat.checkSelfPermission(this.applicationContext,
                Manifest.permission.ACCESS_FINE_LOCATION)
            == PackageManager.PERMISSION_GRANTED) {
            locationPermissionGranted = true
        } else {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                PERMISSIONS_REQUEST_ACCESS_FINE_LOCATION)
        }
    }

    private fun getDeviceLocation() {
        /*
         * Get the best and most recent location of the device, which may be null in rare
         * cases when a location is not available.
         */
        val locationManager = this.getSystemService(LOCATION_SERVICE) as LocationManager
        val criteria = Criteria()
        criteria.horizontalAccuracy = ACCURACY_HIGH

        try {
            if (locationPermissionGranted) {
                lastKnownLocation = locationManager.getLastKnownLocation(locationManager.getBestProvider(criteria, true).toString())
            }
        } catch (e: SecurityException) {
            Log.e("Exception: %s", e.message, e)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int,
                                            permissions: Array<String>,
                                            grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        locationPermissionGranted = false
        when (requestCode) {
            PERMISSIONS_REQUEST_ACCESS_FINE_LOCATION -> {

                // If request is cancelled, the result arrays are empty.
                if (grantResults.isNotEmpty() &&
                    grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    locationPermissionGranted = true
                }
            }
        }
        updateLocationUI()
    }

    private fun updateLocationUI() {
        try {
            if (locationPermissionGranted) {
                mMap.isMyLocationEnabled = true
                mMap.uiSettings.isMyLocationButtonEnabled = true
            } else {
                mMap.isMyLocationEnabled = false
                mMap.uiSettings.isMyLocationButtonEnabled = false
                lastKnownLocation = null
                getLocationPermission()
            }
        } catch (e: SecurityException) {
            Log.e("Exception: %s", e.message, e)
        }
    }

    private fun makePolylineOptions(latLngArray: ArrayList<LatLng>): PolylineOptions {
        val polylineOptions = PolylineOptions().clickable(true)
        for (point in latLngArray) {
            polylineOptions.add(point)
        }
        return polylineOptions
    }

    /* line from current location to first point on route
     * TODO: currently doesn't update when current location changes
     */
    private fun makeArrowOptions(marker: LatLng): PolylineOptions {
        val userLocation = LatLng(lastKnownLocation!!.latitude, lastKnownLocation!!.longitude)
        return PolylineOptions()
            .clickable(true)
            .add(userLocation, marker)
    }

    // return distance and direction from current location to first point
    private fun getDistanceToUser(point: LatLng): Pair<Double, String> {
        val latDiff = point.latitude - lastKnownLocation!!.latitude
        val lngDiff = point.longitude - lastKnownLocation!!.longitude
        val distance = kotlin.math.sqrt(((latDiff) * 111139).pow(2) + ((lngDiff) * 111139).pow(2))
        val direction = when {
            latDiff < 0 -> {
                when {
                    lngDiff < 0 -> "SW"
                    lngDiff > 0 -> "SE"
                    else -> "N"
                }
            }
            latDiff > 0 -> {
                when {
                    lngDiff < 0 -> "NW"
                    lngDiff > 0 -> "NE"
                    else -> "S"
                }
            }
            else -> {
                when {
                    lngDiff < 0 -> "W"
                    lngDiff > 0 -> "E"
                    else -> "N"
                }
            }
        }
        return Pair(distance, direction)
    }

    private fun Double.round(decimals: Int): Double {
        var multiplier = 1.0
        repeat(decimals) { multiplier *= 10 }
        return round(this * multiplier) / multiplier
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap
        mMap.mapType = GoogleMap.MAP_TYPE_SATELLITE

        // get route coordinates and names from menu activity
        val arr = intent.getStringArrayListExtra("points") as ArrayList<String>

        // convert coordinates from string to double
        val doubleArr = ArrayList<Double>()
        for(i in 0 until arr.size) {
            if (i % 3 == 2) continue
            doubleArr.add(arr[i].toDouble())
        }

        // put point names in own array
        val namesArr = ArrayList<String>()
        for(i in 2 until arr.size step 3) {
            namesArr.add(arr[i])
        }

        // convert coordinates from double to LatLng
        val latLngArr = ArrayList<LatLng>()
        for(i in 0 until doubleArr.size step 2) {
            latLngArr.add(LatLng(doubleArr[i],doubleArr[i+1]))
        }

        getLocationPermission()

        updateLocationUI()

        // map user current location
        getDeviceLocation()

        // make marker for first point w/ coords, name, and distance
        val origin = mMap.addMarker(MarkerOptions()
            .position(latLngArr[0])
            .title("1. ${namesArr[0]}")
            .snippet("${latLngArr[0].latitude}, ${latLngArr[0].longitude}"))

        // make markers for remaining points w/ coords and name
        for((i, point) in latLngArr.withIndex()) {
            if(i == 0) continue
            val lat = point.latitude
            val long = point.longitude
            mMap.addMarker(MarkerOptions()
                .position(point)
                .title("${i+1}. ${namesArr[i]}")
                .snippet("$lat, $long"))
        }

        // connect markers by drawing route as polyline
        val traceRoute = mMap.addPolyline(makePolylineOptions(latLngArr))
        traceRoute.color = 0xFFFFE5CC.toInt()

        /* line from current location to first marker
         * (doesn't update when current location changes)
         */
        val toOrigin = mMap.addPolyline(makeArrowOptions(
            LatLng(origin.position.latitude, origin.position.longitude)))
        toOrigin.color = 0x55FFFFFF


        // position camera at first point
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(latLngArr[0], 18.0F))
        origin.showInfoWindow()

        // toast distance and direction to first point every 5 seconds
        val timer = Timer()
        timer.scheduleAtFixedRate(0, 5000) {
            Log.d("tag", "!!!!!! TIMER")
            getDeviceLocation()
            val dist = getDistanceToUser(latLngArr[0])
            this@MapsActivity.runOnUiThread {
                Toast.makeText(
                    applicationContext,
                    "${dist.first.round(1)} m ${dist.second}", Toast.LENGTH_SHORT)
                    .show()
            }
        }
    }
}