import os
import sys
import subprocess
import pandas as pd
import glob

infoDict = {} #Creating the dict to get the metadata tags
exifToolPath = '/usr/bin/exiftool'

#imgPath = './Martin/Pando/images'
imgPath = '../../@files/SEEDSANDSOUTHCAROLINA/'

imagefilenames = glob.glob(os.path.join(imgPath, '*.jpg'))
print(imagefilenames)

for i in range(0, len(imagefilenames)):
    imagefile = imagefilenames[i]
    print(imagefile)
    ''' use Exif tool to get the metadata '''
    process = subprocess.Popen([exifToolPath,imagefile],stdout=subprocess.PIPE,
                               stderr=subprocess.STDOUT,universal_newlines=True) 
    ''' get the tags in dict '''
    for tag in process.stdout:
        line = tag.strip().split(':')
        infoDict[line[0].strip()] = line[-1].strip()
    df = pd.DataFrame.from_records([infoDict])
    parts_lat = df['GPS Latitude'].str.extract('(\d+)(\s)deg(\s)(\d+)\'\s([^"]+)"(\s)([N|S])', expand=True)
    parts_lon = df['GPS Longitude'].str.extract('(\d+)(\s)deg(\s)(\d+)\'\s([^"]+)"(\s)([E|W])', expand=True)
    df['Latitude'] = (parts_lat[0].astype(float) + parts_lat[3].astype(float) /
                      60 + parts_lat[4].astype(float) / 3600) * parts_lat[6].map({'N':1, 'S':-1})
    df['Longitude'] = (parts_lon[0].astype(float) + parts_lon[3].astype(float) /
                       60 + parts_lon[4].astype(float) / 3600) * parts_lon[6].map({'E': 1, 'W':-1})
    if (i == 0):
       df_comb = df
    else:
       df_comb = pd.concat([df_comb, df], axis=0)
       df_comb.reset_index(drop=True, inplace=True)

df_comb.to_csv('test_SC_image_comb.csv')
