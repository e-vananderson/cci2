import os
import pandas as pd

# Get relative directory.
relativeDir = os.path.dirname(__file__)

try:

    # Pull in file.
    mergedDataFrame = pd.read_csv(relativeDir + '/Data/Merged_Data.csv')

    # Create a new 'DataFrame' using the column names as rows.
    definitionsDataFrame = pd.DataFrame(mergedDataFrame.columns)

    # Change the name of the column to 'ColumnName' instead of '0'.
    definitionsDataFrame.rename(columns={0: 'ColumnName'}, inplace=True)

    # Insert the two remaining columns with blank values in their rows.
    definitionsDataFrame.insert(1, 'Ontollogy', 'N/A')
    definitionsDataFrame.insert(2, 'URI', 'N/A')

    # Generate .csv file for the 'mergedData' dataframe.
    definitionsDataFrame.to_csv(relativeDir + '/Data/Merged_Data_definitions.csv', header=True, index=False)
    print("Merged files generated successfully.")

except FileNotFoundError:

    print("The file to generate definitions for was not found.")

except PermissionError:

    print("Please close the `Merged_Data_definitions` file before running this command.")