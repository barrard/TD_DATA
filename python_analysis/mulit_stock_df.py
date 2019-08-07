import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn import linear_model
import pickle

COMMODITIY_SYMBOLS = ["/ES", "/GC", "/CL", "/NG", "/SI", "/ZB", "/ZN"];

symbols = ['BAC', 'MSFT', 'AAPL', 'F', 'GE', 'INTC', 'CSCO', 'CIEN']

# def adjust_dates():#No need any more
#     for symbol in symbols:
#         df = load_data(symbol)
#         print(df.head())

#         time = df['t']*1000
#         df.drop('t', axis=1, inplace=True)
#         df['t'] = time
#         print(df.head())
#         save_csv(df, symbol)


def save_csv(data, symbol):
	data.to_csv('../data/{}/15MIN_{}.csv'.format(symbol, symbol), index=False)
	return True


def load_data_col(symbol, col, timeframe):
	print('Loading {} column {} timeframe {}'.format(symbol, col, timeframe))
	df = pd.read_csv(data_path(symbol, timeframe),
					 usecols=['datetime', 'close', 'volume'],
					 index_col='datetime')
	# df.index = pd.to_datetime(df.index,unit='ms')
	df = df.rename(columns={'close': symbol, 'volume': '{}_vol'.format(symbol)})
	# print(df)
	return df


def load_data(symbol):
	df = pd.read_csv(
		'../data/{}/15MIN_{}.csv'.format(symbol, symbol), index_col='t')
	# df = df.rename(columns={'close':symbol})
	# df.set_index('t', inplace=True)
	return df


# Get reference via SPY
def get_SPY_refrence(timeframe):
	df = load_data_col('SPY', 'close', timeframe)
	return df


def create_main_df(symbols, timeframe):
	df = get_SPY_refrence(timeframe)

	for symbol in symbols:
		df = df.join(load_data_col(symbol, 'close', timeframe))
	# print(df)
	# df.plot()
	# plt.show()
	return df

""" Returns the file path for symbol and given timeframe """
def data_path(sym,tf):
	return './TD_data/{}/{}_{}.csv'.format(sym, sym, tf)


def plot_close_symbol(symbol):
	df = pd.read_csv(data_path(symbol, 'minutely'))
	df['close'].plot()
	plt.show()


def plot_open_close_symbol(symbol):
	df = pd.read_csv(data_path(symbol, 'minutely'))
	df[['high', 'low']][:100].plot()
	plt.show()


# USe SPY as a refrence

# df_minutely = create_main_df(symbols, 'minutely')
# df_daily = create_main_df(symbols, 'daily')

# print(len(df_daily))

# df_daily = df_daily.loc[~df_daily.index.duplicated(keep='first')]
# print(len(df_daily))

# print(df_daily[:15])



# why not just write this file..
# df_daily.to_csv('./TD_main_df_daily.csv')

df = pd.read_csv('TD_main_df_daily.csv')
# df = pd.read_csv('TD_main_df_minutely.csv')
df.fillna(method='ffill', inplace=True)
# df.dropna(inplace=True)
print(df)


def plot_data(title="Stock Prices"):
	plt.xkcd()

	df.index = pd.to_datetime(df.index, unit='ms')

	df = df/df.iloc[0, :]
	ax = df[symbols].plot(title=title, fontsize=12)
	ax.set_xlabel('Date')
	ax.set_ylabel('Price')
	plt.savefig('./cool.png')
	plt.show()


def stock_stats():

	mean = df[symbols].mean()  # each stock one line!!
	std = df[symbols].std()  # each stock one line!!
	mean = df[symbols].mean()  # each stock one line!!
	print('mean \n', mean)
	print('std \n', std)  # higher number indicates a lot of variation over time

reg_g = linear_model.LinearRegression()
def gen_rolling_mean(data, window, ax=False):
	df = np.zeros(window).reshape(-1,1)
	for i in range(len(data)-window):
		reg_g.fit(np.arange(0, window ).reshape(-1,1), data[i:i+window])
		print(reg_g.coef_)
		df = np.append(df, float("{0:.6f}".format(reg_g.coef_[0])))
	print('done')
	df = pd.DataFrame(df, columns=['Rolling Slope {}'.format(window)])
	if(ax):
		df.plot( ax= ax)


	return df



def rolling_stats():
	reg = linear_model.LinearRegression()
	fig, ax = plt.subplots(nrows=2, ncols=1)


	msft = df['MSFT'].values.reshape(-1,1)
	# reg.fit(msft)
	print(msft[0:10])

	msft_slice = df['MSFT']
	msft_slice = msft_slice[-100:]
	msft_slice.reset_index(drop=True, inplace=True)
	print('----------------')
	print((msft_slice))
	print(len(msft_slice))
	# roll_slope_5 = gen_rolling_mean(msft_slice, 2, ax[1])
	# roll_slope_5 = gen_rolling_mean(msft_slice, 5, ax[1])
	# roll_slope_10 = gen_rolling_mean(msft_slice, 10, ax[1])
	# roll_slope_20 = gen_rolling_mean(msft_slice, 20, ax[1])
	# roll_slope_50 = gen_rolling_mean(msft_slice, 50, ax[1])

	msft_slice.plot(title="MSFT rolling mean", label='MSFT', ax= ax[0])
	# rm_20 = df['MSFT'].rolling(window=2000).mean()
	# print(len(df['MSFT']))
	# print(rm_20)
	pd.DataFrame(0, index=np.arange(100), columns=['zero']).plot(ax=ax[1])

	plt.show()
def rolling_mean():
	msft = df['MSFT']
	msft = msft.iloc[-1000:]

	print(msft)
	ax = msft.plot()
	msft_rolling_20 = msft.rolling(window=20).mean()
	msft_rolling = msft.rolling(window=200).mean()
	msft_rolling_20.plot(ax=ax, label='Rolling mean 20')
	msft_rolling.plot(ax=ax, label='Rolling mean 200')
	ax.legend(loc='upper left')
	plt.show()

def plot_daily_returns():
	fig, ax = plt.subplots(nrows=3, ncols=1)

	df_data = df['MSFT'][-1000:]
	# msft = msft.iloc[-1000:]
	returns1 = df_data.copy()
	shift_returns1 = df_data.copy()
	print(df_data)
	print(returns1)

	# returns1[0] = 0
	df_returns = returns1.pct_change(5)

	# blank = returns1
	# blank[1:] = ( df_data[1:].values / df_data[:-1].values) -1

	# print('blank')	
	# print(blank)	
	# print('_______________________________')
	# print((df_data[1:] / df_data[:-1].values  )-1)
	# print(returns1.pct_change(1))
	# blank.plot(ax=ax[1])

	shift_returns1 = ((df_data.shift(-1) / df_data) -1).shift(1)
	shift_returns1[0]=0
	# difference from day to day
	# returns1[1:] = (df_data[1:] - df_data[:-1].values)

	# print('shift_returns1')
	# print(shift_returns1)
	# shift_returns1.plot(ax=ax[2])
	# print('returns1')
	# print(returns1)

	# print('df_data')
	# print(df_data)
	# df_data.plot(ax=ax[0])



	daily_returns = ((df_data.shift(-1) / df_data)-1).shift(1)
	daily_returns[0]=0
	# daily_returns[1:] = (df_data[1:] / df_data[:-1].values)-1
	print('daily_returns')
	print(daily_returns)
	df_data.plot(title='MSFT', ax=ax[0])
	daily_returns_mean = daily_returns.mean()
	daily_returns_std = daily_returns.std()
	
	print('Mean ', daily_returns_mean)
	print('STD ', daily_returns_mean)
	df_returns.plot(title='df_returns', ax=ax[1])
	df_returns.hist(bins=30)
	plt.axvline(daily_returns_mean, color='w', linestyle='dashed', linewidth=2)
	plt.axvline(daily_returns_std, color='r', linestyle='dashed', linewidth=2)
	plt.axvline(-daily_returns_std, color='r', linestyle='dashed', linewidth=2)
	print(daily_returns.kurtosis())
	# daily_returns.plot(title='daily_returns', ax=ax[2])
	plt.show()
	# print(msft.values)
	# print(msft.shift(1))

def daily_returns(data):
	cp = data.copy()
	cp.iloc[1:] = cp.pct_change(1)
	cp.iloc[0] = 0
	return (cp)

def print_bin_count(data, sym):
	print('Bin counts for {}'.format(sym),data.value_counts())
def min_max_returns(data, sym):
	print('Min return for {} is {}'.format(sym, data.min()))
	print('Max return for {} is {}'.format(sym, data.max()))

def plot_scatter(data, x, y, plt):
	data.plot(kind='scatter', x=x, y=y)
	beta, alpha = np.polyfit(data[x], data[y], 1)
	print('beta ', beta)
	print('alpha ', alpha)
	plt.plot(
		data['SPY'], 
		beta*data['SPY']+alpha, 
		'-', color='r')
	


def multiple_stock_returns(symbols):
	# print(df.columns)
	data = df[symbols]
	print(data)
	pct_returns = daily_returns(data)
	pct_returns.hist(bins=20)
	for sym in symbols:
		# pct_returns[sym].hist(bins=20, label=sym)
		print_bin_count(pct_returns[sym], sym)
		min_max_returns(pct_returns[sym], sym)

	print(pct_returns.kurtosis())
	plt.legend(loc='upper right')
	plot_scatter(pct_returns, 'MSFT', 'GE', plt)
	plot_scatter(pct_returns, 'SPY', 'GE', plt)
	plot_scatter(pct_returns, 'MSFT', 'SPY', plt)
	data.plot()
	plt.show()
	


# def add_rolling_stat(df, stat, window):
# plot_data()
# stock_stats()
# rolling_stats()
# rolling_mean()
# plot_daily_returns()

multiple_stock_returns(['MSFT', 'SPY', 'GE'])

