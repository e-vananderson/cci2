import os
import pandas as pd

# Get relative directory.
relativeDir = os.path.dirname(__file__)

try:

    # Pull in files.
    gaDataFrame = pd.read_excel(relativeDir + '/Data/GA lab Data 11_17_2020.xlsx', skiprows=1)
    oregonDataFrame = pd.read_excel(relativeDir + '/Data/Oregon Moisture 10_8_2020.xlsx', skiprows=1,
                                    usecols=[0, 1, 2, 3, 4, 10, 11, 12, 18, 19, 20])
    oregonFallDataFrame = pd.read_excel(relativeDir + '/Data/Oregon_Fall_2020_2021-01-14_12-35-36.xlsx')
    cleanEsriDataFrame = pd.read_csv(relativeDir + '/Data/clean_esri_data.csv')

    # Insert a new column into each dataframe after 'vial #'.
    gaDataFrame.insert(1, 'TreeID', 'N/A')
    oregonDataFrame.insert(1, 'TreeID', 'N/A')

    # Copy the values in the 'DATALABELS' column into the 'TreeID' column.
    gaDataFrame['TreeID'] = gaDataFrame['DATALABELS']
    oregonDataFrame['TreeID'] = oregonDataFrame['DATALABELS']

    # Change the name of the column to 'TreeID' from 'DATALABELS' in the 'TreeID' column.
    gaDataFrame.iloc[0, gaDataFrame.columns.get_loc('TreeID')] = 'TreeID'
    oregonDataFrame.iloc[0, oregonDataFrame.columns.get_loc('TreeID')] = 'TreeID'

    # Change the name of the columns to 'Latitude' and 'Longitude' from 'GPS Lat (N)' and 'GPS Long (W)'.
    oregonFallDataFrame = oregonFallDataFrame.rename({'GPS Lat (N)': 'Latitude', 'GPS Long (W)': 'Longitude'}, axis=1)

    # Round the decimals values of 'cleanEsriDataFrame'
    cleanEsriDataFrame.round(6)

    # Truncate the '_SC' from the end of the 'DATALABEL' in both files.
    gaDataFrame['TreeID'].replace(to_replace=r'((?:_[^_\r\n]*){1})$', value='', regex=True, inplace=True)
    oregonDataFrame['TreeID'].replace(to_replace=r'((?:_[^_\r\n]*){1})$', value='', regex=True, inplace=True)

    # Merge the three files on the 'TreeID' value.
    mergedData = gaDataFrame.merge(oregonDataFrame, on='TreeID', how='inner')\
                            .merge(oregonFallDataFrame, on='TreeID', how='inner')\
                            .merge(cleanEsriDataFrame, on=['Latitude', 'Longitude'], how='left')

    # Generate .csv file for the 'mergedData' dataframe.
    mergedData.to_csv(relativeDir + '/Data/Merged_Data.csv', header=True, index=False)
    print("Merged files generated successfully.")

except FileNotFoundError:

    print("The files to merge were not found.")

except PermissionError:

    print("Please close the `Merged_Data` file before running this command.")
