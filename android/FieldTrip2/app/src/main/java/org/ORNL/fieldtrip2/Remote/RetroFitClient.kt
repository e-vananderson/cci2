package org.ORNL.fieldtrip2.Remote

import retrofit2.Retrofit
import retrofit2.converter.scalars.ScalarsConverterFactory

object RetroFitClient {
    private var retrofit: Retrofit?=null;

    fun getClient(baseURL:String): Retrofit {
        if(retrofit == null)
        {
            retrofit = Retrofit.Builder()
                .baseUrl(baseURL)
                .addConverterFactory(ScalarsConverterFactory.create())
                .build()
        }
        return retrofit!!
    }
}