import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import time


def smpl(data, method, axis):
    op = getattr(data, method)
    rc = 'col' if axis == 0 else 'row'
    # if(axis == 0) rc = 'col'
    # if(axis == 1) rc = 'row'
    print('{} of the {}'.format(method, rc), op())


def pt_time():
    t = time.time()
    print(t)
    return t


def test_slice():
    a = np.random.randint(0, 10, size=(10, 10))
    print(a[0, 1:3])
    print(a[:2, :3])
    print('---------------------------')
    print(a[:2, 1:8:3])
    print('---------------------------')
    print(a)


def test_time():
    tm1 = pt_time()

    a = np.random.randint(0, 10, size=(1000, 1000))
    print(a[0, 1:3])
    print(a)
    smpl(a, 'sum', 0)

    smpl(a, 'sum', 1)

    smpl(a, 'min', 1)

    smpl(a, 'max', 1)

    smpl(a, 'min', 0)

    smpl(a, 'max', 0)

    smpl(a, 'sum', 0)
    tm2 = pt_time()
    print(tm2-tm1)


def test_run_op():
    pt_time()
    np.random.seed(693)

    # print(np.random.normal(50,    10, size=(5, 4)))
    a = np.random.randint(0, 5, size=(5, 4))
    print(a)
    smpl(a, 'sum', 0)

    smpl(a, 'sum', 1)

    smpl(a, 'min', 1)

    smpl(a, 'max', 1)

    smpl(a, 'min', 0)

    smpl(a, 'max', 0)

    smpl(a, 'sum', 0)
    smpl(a, 'mean', 0)
    smpl(a, 'mean', 1)
    pt_time()


def test_run_slice():
    a = np.random.rand(5, 4)
    print('Array :\n', a)
    a[0, 0] = 1
    print(a)

    a[:, 1] = 3
    print(a)

    a[3, :] = 2
    print(a)

    a[4, :] = [9, 8, 7, 6]
    print(a)
    a[:, 3] = [5, 4, 3, 2, 1]
    print(a)


def test_run():
    a = np.random.rand(5)
    print(a)
    indicies = np.array([1, 1, 2, 3])
    print(a[indicies])


test_run()
# test_slice()
