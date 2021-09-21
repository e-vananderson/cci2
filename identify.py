"""
Created by Stantion Martin and Daniel Hopp

Updated 07-APR-2021

sys.argv[1] = name and path of the ESRI datafile
sys.argv[2] = float or integer of the vertical accuracy threshold

identify.py:
Extracts landtype user guides from hard coded data in MCD12_user_guide_to_dfs.py.

Extracts all rows and columns from an ESRI datafile for .csv
export. Second function in place for esrignss-formatted column headers and
columns. Optional .geojson commented out. Main .geojson export is in
generate_geojson.py.

Gets Land Cover by passing lat and long into a MODIS web query. Matches each
lat/long to all landtypes in the Board of Classification's user guide. Each lat/long
match is saved to a JSON file. Note: This function is temporarily disabled.

Daymet weatherdata queried with the cleaned ERSI data by Latitude, Longitude,
Fix Time, and Edit Date. Saves the results to a JSON file. Note: Main function
is commented out. A temp function to test a single lat and long is currently in
place.

"""
import sys
import json
import datetime
import requests
#import geojson
#import asyncio
import pandas as pd
#import pandasql as ps
import MCD12_user_guide_to_dfs as ug
# import classification_testing_data as ctd  # remove from production ver.



def getModisDates(date_start, date_end):
    date_start = date_start.split('-')
    date_start = datetime.date(int(date_start[0]),int(date_start[1]),int(date_start[2]))
    date_end = date_end.split('-')
    date_end = datetime.date(int(date_end[0]),int(date_end[1]),int(date_end[2]))
    day_of_year_start = date_start.strftime('%j')
    day_of_year_end = date_end.strftime('%j')
    year_start = str(date_start.year)
    year_end =   str(date_end.year)
    modis_start = 'A'+year_start + day_of_year_start
    modis_end = 'A' + year_end + day_of_year_end
    print('&startDate=' + modis_start+ '&endDate=' + modis_end)
    return '&startDate=' + modis_start+ '&endDate=' + modis_end

"""
clean_esri_data
@author: Daniel Hopp
Updated 07-APR-2021

Pull Latitude and Longitude collector data if:
    Receiver Name is not blank.
    Creation Date and Fix Time are within 1 minute (inclusive).
    Vertical Accuracy (m) is < user specified (exclusive).

Inserts Lat and Long into a dataframe, and then exports it to a .csv file and
returns a dataframe.

"""
def clean_esri_data(file_path, va_threshold):
    # datetime help from https://www.educative.io/edpresso/how-to-convert-a-
    #   string-to-a-date-in-python
    from datetime import datetime
    from datetime import timedelta

    try:
        
        # array for point jeojson export
        point_features = []
        
        # making dataframe from csv file
        df = pd.read_csv(file_path)
        
        col_names = list(df.columns.values)
        for x in col_names:
            #print(x)
            esri_df = pd.DataFrame(columns = [x])
        
        esrignssFormat = False
        # are the column names in esrignss_xxxxx format?
        for col in df.columns: 
            if col.find('esrignss') > -1:
                esrignssFormat = True
                break
        
        # change NaNs to 0
        df = df.fillna(0)
        
        if (esrignssFormat):
            return clean_esri_esrignss_format(df, point_features, va_threshold)
        else:
            # create dataframe to hold scrubbed results
            esri_df = pd.DataFrame(columns =
            ['Sample Name', 'Latitude', 'Longitude', 'Fix Time', 'EditDate',
    'OBJECTID', 'Speed (km/h)', 'Direction of travel (°)', 'Receiver Name',
    'Horizontal Accuracy (m)', 'Vertical Accuracy (m)', 'Altitude', 'PDOP',
    'HDOP', 'VDOP', 'Fix Type', 'Correction Age', 'Station ID',
    'Number of Satellites', 'GlobalID', 'CreationDate', 'Creator', 'Editor'])
            # help with NaN and column iteration
# borrowed from https://stackoverflow.com/questions/41287171/iterate-
# through-dataframe-and-select-null-values
            for index, row in df.iterrows():
                # if Receiver Name is NaN, ignore row
                if (row['Receiver Name'] != 0):
                    # pull Latitude and Longitude if:
    # Creation Date and Fix Time are within 1 minute of each other.
                     # Vertical Accuracy (m) (col 8) is < user specified (exclusive).
                    if float(row['Vertical Accuracy (m)']) < float(va_threshold):
                        # what date format does the file have?
                        if row['CreationDate'].find('/') != -1:
                            # convert strings to datetime
                            creation_date_obj = datetime.strptime(row['CreationDate'],
                                                                  '%m/%d/%Y %H:%M')
                            fix_time_obj = datetime.strptime(row['Fix Time'],
                                                              '%m/%d/%Y %H:%M')
                        else:
                            creation_date_obj = datetime.strptime(row['CreationDate'],
                                                                  '%Y-%m-%d %H:%M')
                            fix_time_obj = datetime.strptime(row['Fix Time'],
                                                              '%Y-%m-%d %H:%M')
                    if creation_date_obj - fix_time_obj <= timedelta(minutes=60):
                        # append to clean esri datatable
                        esri_df = esri_df.append({
'Sample Name' : row['Sample Name'], 'Latitude' : row['Latitude'],
'Longitude' : row['Longitude'], 'Fix Time' : row['Fix Time'],
'EditDate' : row['EditDate'],
'OBJECTID' : row['OBJECTID'], 'Speed (km/h)' : row['Speed (km/h)'],
'Direction of travel (°)' : row['Direction of travel (°)'],
'Receiver Name' : row['Receiver Name'],
'Horizontal Accuracy (m)' : row['Horizontal Accuracy (m)'],
'Vertical Accuracy (m)' : row['Vertical Accuracy (m)'],
'Altitude' : row['Altitude'], 'PDOP' : row['PDOP'], 'HDOP' : row['HDOP'],
'VDOP' : row['VDOP'], 'Fix Type' : row['Fix Type'],
'Correction Age' : row['Correction Age'],
'Station ID' : row['Station ID'],
'Number of Satellites' : row['Number of Satellites'],
'GlobalID' : row['GlobalID'],
'CreationDate' : row['CreationDate'], 'Creator' : row['Creator'],
'Editor' : row['Editor']
                                                  }, ignore_index = True)    
            
            # export lat, long, fix time, and end date to .csv
            esri_df.to_csv('clean_esri_data.csv', index=False)     
            print('clean_esri_data.csv is exported.')       
            
            return esri_df
    except ValueError as verr:
        print('ValueError:', verr)
        exit()
    except TypeError as terr:
        print('TypeError:', terr)
        exit()
    except KeyError as kerr:
        print('A column in the file is missing or has moved:')
        print(kerr)
        exit()
    except FileNotFoundError:
        print('The import file was not found!')
        exit()
    except:
        print('Unexpected error:', sys.exc_info()[0])
        exit()
        
def clean_esri_esrignss_format(df, point_features, va_threshold):
    print('clean_esri_esrignss_format firing')
    from datetime import datetime
    from datetime import timedelta
    # geojson export help from https://gis.stackexchange.com/questions/130963/write-geojson-into-a-geojson-file-with-python
    # MUST HAVE GEOJSON INSTALLED - https://pypi.org/project/geojson/
    from geojson import Point, Feature, FeatureCollection, dump
    try:
                # create dataframe to hold scrubbed results
        esri_df = pd.DataFrame(columns =
            ['Sample Name', 'Latitude', 'Longitude', 'Fix Time', 'EditDate',
    'Speed (km/h)', 'Direction of travel (°)', 'Receiver Name',
    'Horizontal Accuracy (m)', 'Vertical Accuracy (m)', 'Altitude', 'PDOP',
    'HDOP', 'VDOP', 'Fix Type', 'Correction Age', 'Station ID',
    'Number of Satellites', 'GlobalID', 'CreationDate', 'Creator', 'Editor',
    'Observation', 'Severity','Date', 'Azimuth', 'Positionsourcetype', 
    'Avg H Rms', 'avg_v_rms', 'Avg Positions', 'h_stddev', 'ColumnNumber',
    'RowNumber', 'Block Number', 'Genotype Name', 'Notes'])
        
        for index, row in df.iterrows():
            # if Receiver Name is NaN, ignore row
            if (row['esrignss_receiver'] != 0):
                if float(row['esrignss_v_rms']) < float(va_threshold):
                    # what date format does the file have?
                    if row['CreationDate'].find('/') != -1:
                        creation_date_obj = datetime.strptime(row['CreationDate'],
                                                              '%m/%d/%Y %H:%M')
                        fix_time_obj = datetime.strptime(row['esrignss_fixdatetime'],
                                                          '%m/%d/%Y %H:%M')
                    else:
                        creation_date_obj = datetime.strptime(row['CreationDate'],
                                                              '%Y-%m-%d %H:%M')
                        fix_time_obj = datetime.strptime(row['esrignss_fixdatetime'],
                                                          '%Y-%m-%d %H:%M')
                if creation_date_obj - fix_time_obj <= timedelta(minutes=1):              
                    # append to clean esri datatable     

                    # replace * in RowNumber column
                    row_number = str(row['RowNumber'])                    
                    if row_number.find('*') != -1:
                        row_number = "ask"
                    else:
                        row_number = str(int(row['RowNumber']))
                    
                    esri_df = esri_df.append(
{'Sample Name' : (str(row['GenotypeName']) + '-Co' + str(int(row['ColumnNumber'])) + '_' +
                  row_number + '_' + str(int(row['BlockNumber']))),
                                              'Latitude' : row['esrignss_latitude'],
                                              'Longitude' : row['esrignss_longitude'],
                                              'Fix Time' : row['esrignss_fixdatetime'],
                                              'EditDate' : row['EditDate'],
'Speed (km/h)' : row['esrignss_speed'],
'Direction of travel (°)' : row['esrignss_direction'],
'Receiver Name' : row['esrignss_receiver'],
'Horizontal Accuracy (m)' : row['esrignss_h_rms'],
'Vertical Accuracy (m)' : row['esrignss_v_rms'],
'Altitude' : row['esrignss_altitude'], 'PDOP' : row['esrignss_pdop'],
'HDOP' : row['esrignss_hdop'],
'VDOP' : row['esrignss_vdop'], 'Fix Type' : row['esrignss_fixtype'],
'Correction Age' : row['esrignss_correctionage'],
'Station ID' : row['esrignss_stationid'],
'Number of Satellites' : row['esrignss_numsats'],
'GlobalID' : row['GlobalID'],
'CreationDate' : row['CreationDate'], 
'Creator' : row['Creator'], 'Editor' : row['Editor'],
'Observation' : row['Observation'], 'Severity' : row['Severity'],
'Date' : row['Date'],
'Azimuth' : row['esrisnsr_azimuth'],
'Positionsourcetype' : row['esrignss_positionsourcetype'], 
'Avg H Rms' : row['esrignss_avg_h_rms'], 'Avg V Rms' : row['esrignss_avg_v_rms'],
'Avg Positions' : row['esrignss_avg_positions'], 'H Stddev' : row['esrignss_h_stddev'],
'ColumnNumber' : row['ColumnNumber'],
'RowNumber' : row['RowNumber'],
'Block Number' : row['BlockNumber'],
'Genotype Name' : row['GenotypeName'],
'Notes' : row['Notes']}, ignore_index = True)             
                     
        # export lat, long, fix time, and end date to .csv
        esri_df.to_csv('clean_esri_data.csv', index=False)     
        print('clean_esri_data.csv is exported.')       
        # # print(esri_df)
        
        return esri_df
    except ValueError as verr:
        print('ValueError:', verr)
        exit()
    except TypeError as terr:
        print('TypeError:', terr)
        exit()
    except KeyError as kerr:
        print('A column in the file is missing or has moved:')
        print(kerr)
        exit()
    except:
        print('Unexpected error:', sys.exc_info()[0])
        exit()    
        

def get_landcover(lat,long,modisDateQuery):

    # create dataframe to hold Class and Description. Name column is for
    # Unreal Engine import
    class_desc = pd.DataFrame(columns = ['Name', 'UE_Level',
                                         'Class', 'Description'])

    query = (MODIS_BASE+'MCD12Q1/subset?latitude='+lat+'&longitude='+long+
             modisDateQuery+'&kmAboveBelow=0&kmLeftRight=0')
    response = requests.get(query, headers=header)
    if response.status_code == 200:
        res = json.loads(response.content.decode('utf-8'))
        subset = res["subset"]
        for x in subset:
            band = x["band"].strip()
            data = x["data"]
            if len(data) == 1:
                val = str((data[0]))
                ClassificationType = table1['Description'][table1.index == band]
                CL =(ClassificationType[band])
                if "IGBP" in CL:
                    IGB = get_classification(val, table3)
                    UE_name = get_UE_name(val, table3)
                    UE_level = get_UE_level(val, table3)
                elif "UMD" in CL:
                    IGB = get_classification(val, table4)
                    UE_name = get_UE_name(val, table4)
                    UE_level = get_UE_level(val, table4)                    
                elif "LAI" in CL:
                    IGB = get_classification(val, table5)
                    UE_name = get_UE_name(val, table5)
                    UE_level = get_UE_level(val, table5)                    
                elif "BGC" in CL:
                    IGB = get_classification(val, table6)
                    UE_name = get_UE_name(val, table6)
                    UE_level = get_UE_level(val, table6)                    
                elif "PFT" in CL:
                    IGB = get_classification(val, table7)
                    UE_name = get_UE_name(val, table7)
                    UE_level = get_UE_level(val, table7)                    
                # LC_Prop#_Assessment ###################
                elif "LCCS1 land cover layer confidence" in CL:
                    IGB = 'Confidence ' + val + ' percent.'
                    UE_name = 'LCSS1_Confidence'
                    UE_level = 'lvlThe_Void'
                elif "LCCS2 land use layer confidence" in CL:
                    IGB = 'Confidence ' + val + ' percent.'
                    UE_name = 'LCSS2_Confidence'
                    UE_level = 'lvlThe_Void'                    
                elif "LCCS3 surface hydrology layer confidence" in CL:
                    IGB = 'Confidence ' + val + ' percent.'
                    UE_name = 'LCSS3_Confidence'
                    UE_level = 'lvlThe_Void'                    
                #########################################################
                elif "LCCS1 land cover layer" in CL:
                    IGB = get_classification(val, table8)
                    UE_name = get_UE_name(val, table8)
                    UE_level = get_UE_level(val, table8)                    
                elif "LCCS2 land use layer" in CL:
                    IGB = get_classification(val, table9)
                    UE_name = get_UE_name(val, table9)
                    UE_level = get_UE_level(val, table9)                    
                elif "LCCS3 surface hydrology layer" in CL:
                    IGB = get_classification(val, table10)
                    UE_name = get_UE_name(val, table10)
                    UE_level = get_UE_level(val, table10)                    
                elif "Product quality flags" in CL:
                    IGB = get_classification(val, table11)
                    UE_name = get_UE_name(val, table11)
                    UE_level = get_UE_level(val, table11)                    
                    #LW
                elif "Binary land (class 2) / water (class 1)" in CL:
                    IGB = 'Binary land (class 2) / Water (class 1)'
                    UE_name = 'LW_Binary'
                    UE_level = 'lvlThe_Void'

                # populate table with class and description
                class_desc = class_desc.append({'Name' : UE_name,
                                                'UE_Level' : UE_level,
                                                'Class' : CL,
                                                'Description' : IGB},
                                                ignore_index = True)
                data = data[0]

        #export class_desc table to JSON file
        class_desc.to_json('Class_Descriptions_lat_' + lat + '_lon_' + long + 
                           '.json',
                            orient='records')
    else:
        return response.status_code

    return ('Class Description JSON lat: ' + lat + ' long: ' + long +
            ' file exported.')


# query User Guide Classification tables using Value column
def get_classification(val, table):
    # if len(data) == 1:
    try:
        # val = (data[0])
        N = table.loc[table['Value'] == val, 'Name'].iloc[0]
        D = table.loc[table['Value'] == val, 'Description'].iloc[0]
        return N + ' - ' + D
    except IndexError:
        print('No value ' + val + ' found in the table!')
        return 'No_Value_Found', 'No_Value_Found'

def get_UE_name(val, table):
    # if len(data) == 1:
    try:
        # val = (data[0])
        N = table.loc[table['Value'] == val, 'UE_Name_Column'].iloc[0]
        return N
    except IndexError:
        print('No value ' + val + ' found in the table!')
        return 'No_Value_Found', 'No_Value_Found'
    
def get_UE_level(val, table):
    # if len(data) == 1:
    try:
        # val = (data[0])
        L = table.loc[table['Value'] == val, 'UE_Level'].iloc[0]
        return L
    except IndexError:
        print('No value ' + val + ' found in the table!')
        return 'No_Value_Found', 'No_Value_Found'

# Date to string functions
def create_file_save_date(date):
    file_date = get_date_from_string(date)
    file_date_str = (get_year_from_string(file_date) + '-' +
                    get_month_from_string(file_date)  + '-' +
                    get_day_from_string(file_date))
    return file_date_str
    
def get_date_from_string(date):
    if date.find('/') != -1:
        return datetime.datetime.strptime(date, '%m/%d/%Y %H:%M')
    else:
        return datetime.datetime.strptime(date, '%Y-%m-%d %H:%M')
def get_month_from_string(date):
    return str(date.month)
def get_day_from_string(date):
    return str(date.day)
def get_year_from_string(date):
    return str(date.year)

# fix time = start date, edit date = end date
def get_daymet_daterange_URL(fix_time, edit_date):

    date_ft = get_date_from_string(fix_time)
    date_ed = get_date_from_string(edit_date)

    date_start_month = get_month_from_string(date_ft)
    date_start_day = get_day_from_string(date_ft)
    date_start_year = get_year_from_string(date_ft)

    date_end_month = get_month_from_string(date_ed)
    date_end_day = get_day_from_string(date_ed)
    date_end_year = get_year_from_string(date_ed)

    dates_url = ('&start=' + date_start_year + '-' + date_start_month + '-' +
                 date_start_day +
                 '&end=' + date_end_year + '-' + date_end_month + '-' +
                 date_end_day)
    return dates_url



#https://daymet.ornl.gov/single-pixel/api/data?lat=43.1&lon=-85.3&format=
#json&start=2012-01-31&end=2012-01-31
# query daymet page for weather data by lat, long,
# and MODIS fix time(start date), edit date (end date)
def get_daymet(lat, long, date_start, date_end):
    url = ('https://daymet.ornl.gov/single-pixel/api/data?lat=' + lat +
           '&lon=' + long + '&format=json' +
           get_daymet_daterange_URL(date_start, date_end))
    query = url
    response = requests.get(query, headers=header)
    if response.status_code == 200:
        return json.loads(response.content.decode('utf-8'))
    else:
        return None


###### BEGIN IDENTIFY.PY ################################

# base URL for MODIS website query
MODIS_BASE = 'https://modis.ornl.gov/rst/api/v1/'       

#header for MODIS website query
header = {'Content-Type':'application/json'}

#date range for MODIS website query
DATE_START ='2010-01-01'
DATE_END = '2010-12-31'

#call funtion to create date range URL for MODIS query
modisDateQuery = getModisDates(DATE_START,DATE_END)
# #print(modisDateQuery)

# get clean esri data and pass into a dataframe
clean_esri_data_df = clean_esri_data(sys.argv[1], sys.argv[2])

# unused(?)
PRODUCT = 'MCD12Q1/'


#endpoint = 'products';

# create the user guide tables from hard-code
table1 = ug.MCD12_user_guide()[0]
table2 = ug.MCD12_user_guide()[1]
table3 = ug.MCD12_user_guide()[2]
table4 = ug.MCD12_user_guide()[3]
table5 = ug.MCD12_user_guide()[4]
table6 = ug.MCD12_user_guide()[5]
table7 = ug.MCD12_user_guide()[6]
table8 = ug.MCD12_user_guide()[7]
table9 = ug.MCD12_user_guide()[8]
table10 = ug.MCD12_user_guide()[9]
table11 = ug.MCD12_user_guide()[10]
table12 = ug.MCD12_user_guide()[11]

# set indexes for the Data Set tables
table1.set_index('Short_Name', inplace = True)
table2.set_index('Short_Name', inplace = True)



####### Old Code??? ########################################################
# pass
#lat = sys.argv[1];

#long = sys.argv[2];
#DATE_START = sys.argv[3];
#DATE_END = sys.argv[4];

#print (lat + long + BeginDate + EndDate);
#Parameters that should be supplied by some user interface

#JSON lat longs
#infile = open ('C:\\Users\\msk\\Desktop\\CBI\\DATA\\commongardens\\CG_centroids.geojson','r');

#data = geojson.load(infile);

#for coordinates in data:
#    print (coordinates);
######## end Old Code ####################################################


#### GET LANDCOVER ####################################################
# # loop through clean esri data coords to print landcover results
# for df_index, r in clean_esri_data_df.iterrows():
#     LAT = str(r['Latitude'])
#     LONG = str(r['Longitude'])
#     # response = requests.get('https://modis.ornl.gov/rst/api/v1/MCD12Q1/dates?latitude='+
#     #                          LAT + '&longitude=' + LONG, headers=header)
#     landcover = get_landcover(LAT, LONG, modisDateQuery)
#     print (landcover)
#### END GET LANDCOVER ##############################################


######## commented out 21-JAN-2021 #################
# dates = json.loads(response.text)['dates']
# #print(dates);
# modis_dates = [i['modis_date'] for i in dates]
# calendar_dates = [i['calendar_date'] for i in dates]
#####################################################




#### 31-JAN-2021: DISABLED TO ALLOW for daymetTesting() #############
# # loop through clean_esri dates and data coords to export
# # weather data to a JSON file
# for df_index, r in clean_esri_data_df.iterrows():
#     i = 1
#     LAT = str(r['Latitude'])
#     LONG = str(r['Longitude'])
#     FIX_TIME = str(r['Fix Time'])
#     EDIT_DATE = str(r['EditDate'])
#     #hardcode dates for testing
#     # daymet = get_daymet(LAT, LONG, '10/15/2019 13:05', '10/15/2019 13:06')
#     daymet = get_daymet(LAT, LONG, FIX_TIME, EDIT_DATE)
#     # print (daymet)
#     # create file date string
#     file_date_str = create_file_save_date(FIX_TIME)
#     with open('weatherdata_' + str(i) + '_lat_' + LAT + '_lon_' + LONG + '_' +
#               file_date_str + '.json', 'w') as f:
#         json.dump(daymet, f)
#     i += 1
##################################################################

# Daymet testing
def daymetTesting():
    i = 1
    LAT = '35.84406013'
    LONG = '-83.95906955'
    FIX_TIME = '10/15/2019 13:05'
    EDIT_DATE = '10/15/2019 13:06'
    #hardcode dates for testing
    daymet = get_daymet(LAT, LONG, FIX_TIME, EDIT_DATE)
    # print (daymet)

    # create file date string
    file_date_str = create_file_save_date(FIX_TIME)

    with open('weatherdata_' + str(i) + '_lat_' + LAT + '_lon_' + LONG + '_' +
              file_date_str + '.json', 'w') as f:
        json.dump(daymet, f)

daymetTesting()
print('Weatherdata JSON is exported.')