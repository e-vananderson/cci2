"""
Created on Thu Mar 19 2021

@author: Daniel Hopp

Exports merged GA lab Data, Oregon Moisture, Oregon Fall, and clean esri data
to a geojson file for inport into Cesium. Dependenent on engine_merge.py.
"""
# geojson export help from https://gis.stackexchange.com/questions/130963/write-geojson-into-a-geojson-file-with-python
# MUST HAVE GEOJSON INSTALLED - https://pypi.org/project/geojson/
import sys
import pandas
from geojson import Point, Feature, FeatureCollection, dump


def generate_geojson(geojson_df):
    try:
        
        # array for point jeojson export
        point_features = []

        
        # making dataframe from csv file
        df = geojson_df
        
        # change NaNs to 0
        df = df.fillna(0)

        for index, row in df.iterrows():
            # add points and properties to geojson point_features
            # the esri coords expect the order of: Longitude, LatLatitude
            
            point = Point((row['Longitude_y'], row['Latitude']))
            point_features.append(Feature(geometry = point,
properties = {
'latitude': row['Latitude'], 'longitude' : row['Longitude_y'],
'creation_date' : row['CreationDate'],
'sample_id' : row['Sample ID'],
'tree_id' : row['TreeID'],
'global_id' : row['GlobalID'],
'vial_x' : row['Vial #_x'],
'vial_y' : row['Vial #_y'],
'lbc' : row['LBC'],
'lbc_eq' : row['LBCeq'],
'ph' : row['pH'],
'ca' : row['Ca'],
'k' : row['K'],
'mg' : row['Mg'],
'mn' : row['Mn'],
'p' : row['P'],
'zn' : row['Zn'],
'ammonium' : row['Ammonium'],
'no2' : row['NO2'],
'no3' : row['NO3'],
'c' : row['C'],
'n' : row['N'],
'r1_soil_g' : row['R1 (soil g)'],
'tin_g' : row['Tin (g)'],
'dry_soil_g_pls_tin' : row['Dry Soil (g) + tin'],
'dry_soil_mns_tin_g' : row['Dry Soil -Tin (g)'],
'mc_wet_basis' : row['MC (wet basis)'],
'mc_dry_basis' : row['MC (dry basis)'],
'mc_pct_dry' : row['MC (%) dry'],
'r2_soil_g' : row['R2 (soil g)'],
'tin_g_1' : row['Tin (g).1'],
'dry_soil_g_pls_tin_1' : row['Dry Soil (g) + tin.1'],
'dry_soil_mns_tin_g_1' : row['Dry Soil -Tin (g).1'],
'mc_Wet_basis' : row['MC (Wet basis)'],
'mc_dry_basis_1' : row['MC (dry basis).1'],
'MC_pct_dry_1' : row['MC (%) dry.1'],
'r3_soil_g' : row['R3 (soil g)'],
'tin_g_2' : row['Tin (g).2'],
'dry_soil_g_pls_tin_2' : row['Dry Soil (g) + tin.2'],
'dry_soil_mns_tin_g_2' : row['Dry Soil -Tin (g).2'],
'mc_wet_basis_1' : row['MC (wet basis).1'],
'mc_dry_basis_2' : row['MC (dry basis).2'],
'mc_pct_dry_2' : row['MC (%) dry.2'],
'soil_moisture' : row['Soil Moisture'],
'collection_date' : str(row['Collection Date']),
'file_name' : row['File Name'],
'site' : row['Site'],
'genotype' : row['Genotype'],
'replicate' : row['Replicate'],
'position_row_position' : row['Position (Row_Position)'],
'latitude_x' : row['Latitude_x'],
'longitude_y' : row['Longitude'],
'total_tree_height' : row['Total Tree Height'],
'dbh' : row['DBH'],
'date_pg_1' : row['Date (pg 1)'],
'personnel_pg1' : row['Personnel (pg1)'],
'notes_pg1' : row['Notes (pg1)'],
'tree_soil_sc_blue_ice' : row['Tree Soil (SC_blue ice)'],
'tree_soil_sd_ssm_dry_ice' : row['Tree Soil (SD$SSM_dry ice)'],
'tree_soil_date' : str(row['Tree Soil Date']),
'tree_soil_time' : str(row['Tree Soil Time']),
'background_soil_sc_blue_ice' : row['Background Soil (SC_blue ice)'],
'background_soil_sd_ssm_dry_ice' : row['Background Soil (SD$SSM_dry ice)'],
'background_soil_date' : str(row['Background Soil Date']),
'background_soil_time' : str(row['Background Soil Time']),
'leaves_ld_slm_dry_ice' : row['Leaves (LD$SLM_dry ice)'],
'leaves_date' : str(row['Leaves Date']),
'leaves_time' : str(row['Leaves Time']),
'roots_rd_srm_dry_ice' : row['Roots (RD$SRM_dry ice)'],
'roots_date' : str(row['Roots Date']),
'roots_time' : str(row['Roots Time']),
'personnel_pg2' : row['Personnel (pg2)'],
'notes_pg2' : row['Notes (pg2)'],
'row_name' : row['Row Name'],
'x' : row['X'],
'y' : row['Y'],
'object_id' : row['OBJECTID'], 'speed_kph' : row['Speed (km/h)'],
'direction_of_travel_deg' : row['Direction of travel (°)'],
'receiver_name' : row['Receiver Name'],
'horizontal_accuracy_m' : row['Horizontal Accuracy (m)'],
'vertical_accuracy_m' : row['Vertical Accuracy (m)'],
'altitude' : row['Altitude'], 'pdop' : row['PDOP'], 'hdop' : row['HDOP'],
'vdop' : row['VDOP'], 'fix_type' : row['Fix Type'],
'correction_age' : row['Correction Age'],
'station_id' : row['Station ID'],
'number_of_satellites' : row['Number of Satellites'],
'fix_time' : row['Fix Time'], 'creator' : row['Creator'],
'edit_date' : row['EditDate'], 'editor' : row['Editor']}))
                        
    
        #output Lat and Long dataframe to a .geojson file
        feature_collection = FeatureCollection(point_features)
        with open('engine_merged.geojson', 'w') as f:
            dump(feature_collection, f)
        print('Point Layer 0 Merged GEOJSON is exported.')
                  
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