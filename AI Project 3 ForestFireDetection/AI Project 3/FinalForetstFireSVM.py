import getopt
import sys
import pandas as pd
import calendar as cal
import math
import matplotlib.pyplot as plt
from sklearn.model_selection import KFold, cross_val_predict, cross_val_score
from sklearn import metrics
from sklearn import svm
from sklearn.neighbors import NearestNeighbors
import numpy as np
from math import sqrt, fabs, log


class FinalProject3:
    def __init__(self):
      self.drop = []
      self.count = 30
      self.cross_val = 10
    
    def findResults(self,drop):
        #df = pd.read_csv('../data/forestfires.csv')
        df = pd.read_csv('forestfires.csv')
        # dictionary used to translate month names to integer, 1 for january
        month_to_num_dict = {key.lower(): value for value, key in enumerate(cal.month_abbr)}
        # dictionary used to translate day names to integer, 0 for monday
        day_to_num_dict = {key.lower(): value for value, key in enumerate(cal.day_abbr)}

        grouped = df.groupby('month')
        for group in grouped:
            df.replace(group[0], month_to_num_dict[group[0]], inplace=True)

        grouped = df.groupby('day')
        for group in grouped:
            df.replace(group[0], day_to_num_dict[group[0]], inplace=True)

        if drop:
            df.drop(drop, 1, inplace=True)

        feature_length = len(df)
        X = df.iloc[:, 0:feature_length].values
        y = df.iloc[:, -1].values

        print "Features used: ",
        for column in df.columns[:-1]:
            print column,
        print "\n"
        
        
        Epsilon=findEpsilon(df)
        Gamma=0.1
        c_values = [0.0001, 1, 3, 100]
        for c in c_values:
            gaussian_svm = svm.SVR(kernel='rbf', C=c, gamma=Gamma, epsilon=Epsilon)
            predicted = cross_val_predict(gaussian_svm, X, y, cv=self.cross_val)
            print "For C =", c, "and gamma =", Gamma , "and epsilon =", Epsilon, "RMSE:", math.sqrt(metrics.mean_squared_error(y, predicted))
    
def findEpsilon(df):
    # finds epsilon by first finding the mean
    means = []
    for column in df:
        means.append(df[column].mean())
    # nexts finds the 3 nearest neighbors
    nbrs = NearestNeighbors(n_neighbors=3).fit(df)
    distances, indices = nbrs.kneighbors([means])
    # Finds their squared devience
    sqr_dev = []
    for distance in distances:
        sqr_dev.append(distance ** 2)
    # Calculates the mean of that
    std_dev = np.mean(sqr_dev)
    N = len(df.index)
    # Then returns the proper equation
    return 3 * std_dev * sqrt( log(N) / N )

def main():
  (options, args) = getopt.getopt(sys.argv[1:], '')
  drop=[]
  for arg in args:
      arg+=","
      drop= arg.split(',')

  class_obj=FinalProject3()
  if  drop:
      print "Dropping features", drop[:-1]
      class_obj.findResults(drop[:-1])
  else:
      class_obj.findResults([])



if __name__ == "__main__":
    main()

