import pandas as pd

all_symbols = [
    'SPY',
    "F",
    "GE",
    "BAC",
    "NOK",
    "PBR",
    "CAG",
    "T",
    "ABEV",
    "NIO",
    "ABBV",
    "QD",
    "GOLD",
    "BABA",
    "ECA",
    "ITUB",
    "PFE",
    "FCX",
    "RAD",
    "TEVA",
    "UBER",
    "CZR",
    "AMD",
    "MU",
    "CSCO",
    "IQ",
    "INTC",
    "SIRI",
    "CMG",
    "CHNG",
    "QQQ",
    "AAPL",
    "ZNGA",
    "MSFT",
    "JD",
    "TVIX",
    "OSTK",
    "WBA",
    "ADPT",
    "NVDA",
    "FB",
    "TDD",
    "GBTC",
    "SRCI",
    "NG",
    "BTG",
    "SBUX",
    "HEXO",
    "CVRS",
    "LNG",
    "CIEN",
    "XXII",
    "REI",
    "SAND",
    "GGN",
    "CVM",
    "UUUU",
    "PAGS",
    "FAX",
    "GORO",
    "KSHB"
]


def clean_all_dup_datetimes():
    for sym in all_symbols:
        remove_dup_datetime(sym, 'minutely')

def remove_dup_datetime(sym, timeframe):
    df = pd.read_csv('./TD_data/{}/{}_{}.csv'.format(sym, sym, timeframe))
    # print(df)
    print(len(df))
    # print(df.columns)
    df = df.drop_duplicates(subset='datetime')

    print(len(df))
    # print(df)
    df.to_csv('./TD_data/{}/{}_{}.csv'.format(sym, sym, timeframe), index=False)


clean_all_dup_datetimes()
