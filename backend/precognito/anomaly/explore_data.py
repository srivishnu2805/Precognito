import pandas as pd
import numpy as np

# Load dataset
df = pd.read_csv('predictive_maintenance.csv')

print('Dataset Shape:', df.shape)
print('\nColumns:', df.columns.tolist())
print('\nFirst 5 rows:')
print(df.head())

print('\nTarget distribution:')
print(df['Target'].value_counts())
print('Normal:', (df['Target'] == 0).sum(), f'({(df["Target"] == 0).sum()/len(df)*100:.1f}%)')
print('Failures:', (df['Target'] == 1).sum(), f'({(df["Target"] == 1).sum()/len(df)*100:.1f}%)')

print('\nFailure Types:')
print(df['Failure Type'].value_counts())

print('\nProduct Types:')
print(df['Type'].value_counts())

print('\nSensor data statistics:')
sensor_cols = ['Air temperature [K]', 'Process temperature [K]', 'Rotational speed [rpm]', 'Torque [Nm]', 'Tool wear [min]']
print(df[sensor_cols].describe())

print('\nMissing values:')
print(df.isnull().sum())
