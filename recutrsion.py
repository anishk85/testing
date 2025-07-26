def recursive_sum(arr, index=0):
    """
    Recursively calculates the sum of all elements in the array.
    """
    if index == len(arr):
        return 0
    return arr[index] + recursive_sum(arr, index + 1)

def recursive_factorial(n):
    """
    Recursively calculates the factorial of n.
    """
    if n == 0 or n == 1:
        return 1
    return n * recursive_factorial(n - 1)

def recursive_fibonacci(n):
    """
    Recursively calculates the nth Fibonacci number.
    """
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    return recursive_fibonacci(n - 1) + recursive_fibonacci(n - 2)

def recursive_reverse(s):
    """
    Recursively reverses a string.
    """
    if len(s) == 0:
        return ""
    return recursive_reverse(s[1:]) + s[0]

def recursive_binary_search(arr, target, left=0, right=None):
    """
    Recursively performs binary search on a sorted array.
    Returns the index of target if found, else -1.
    """
    if right is None:
        right = len(arr) - 1
    if left > right:
        return -1
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return recursive_binary_search(arr, target, mid + 1, right)
    else:
        return recursive_binary_search(arr, target, left, mid - 1)

def recursive_power(x, n):
    """
    Recursively calculates x raised to the power n.
    """
    if n == 0:
        return 1
    return x * recursive_power(x, n - 1)

def recursive_flatten(lst):
    """
    Recursively flattens a nested list.
    """
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(recursive_flatten(item))
        else:
            result.append(item)
    return result

def recursive_gcd(a, b):
    """
    Recursively calculates the greatest common divisor of a and b.
    """
    if b == 0:
        return a
    return recursive_gcd(b, a % b)

def recursive_merge_sort(arr):
    """
    Recursively sorts an array using merge sort.
    """
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = recursive_merge_sort(arr[:mid])
    right = recursive_merge_sort(arr[mid:])
    return recursive_merge(left, right)

def recursive_merge(left, right):
    """
    Helper function for merge sort to merge two sorted lists.
    """
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Example usage:
if __name__ == "__main__":
    print("Sum:", recursive_sum([1, 2, 3, 4, 5]))
    print("Factorial:", recursive_factorial(5))
    print("Fibonacci:", recursive_fibonacci(10))
    print("Reverse:", recursive_reverse("recursion"))
    print("Binary Search:", recursive_binary_search([1, 2, 3, 4, 5, 6, 7], 4))
    print("Power:", recursive_power(2, 10))
    print("Flatten:", recursive_flatten([1, [2, [3, 4], 5], 6]))
    print("GCD:", recursive_gcd(48, 18))
    print("Merge Sort:", recursive_merge_sort([5, 2, 9, 1, 5, 6]))