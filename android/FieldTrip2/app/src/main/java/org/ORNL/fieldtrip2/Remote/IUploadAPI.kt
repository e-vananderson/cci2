package org.ORNL.fieldtrip2.Remote

import okhttp3.MultipartBody
import retrofit2.Call
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface IUploadAPI {
    @Multipart
    @POST("/CBI/CommonGarden/upload.php")
    fun uploadFile(@Part file: MultipartBody.Part): Call<String>
}