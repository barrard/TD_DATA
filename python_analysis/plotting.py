import pandas as pd
import matplotlib.pyplot as plt

def plot_close_symbol(symbol):
    df = pd.read_csv('../TD_data/{}/{}_minutely.csv'.format(symbol, symbol))
    df['datetime'].plot()
    plt.show()
    
def plot_open_close_symbol(symbol):
    df = pd.read_csv('../TD_data/{}/{}_minutely.csv'.format(symbol, symbol))
    df[['high','low']][:100].plot()
    plt.show()
    



plot_open_close_symbol('MSFT')