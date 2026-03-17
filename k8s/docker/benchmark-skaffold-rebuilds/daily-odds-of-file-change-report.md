# Dockerfile Git Change Frequency Analysis (6am Pacific Daily Build Basis)

Window: 2025-03-14 to 2026-03-14.  
Method: for each day at 6:00am Pacific, compare the relevant `COPY` inputs to the previous day's 6:00am Pacific snapshot. If any commit landed in that 24-hour checkpoint window, that day is a cache miss. The report below groups exact day spans between those miss days, including boundary spans so the weighted total covers the full 365-day window.

## Days Between Git Changes

### `code-dot-org.dockerfile`

Average days between changes: `1.26`  
Median days between changes: `1.00`  
Cache hit days: `21.10%`  
Cache miss days: `78.90%`

Days between file changes:

```text
237x    1d between   ████████████████████████ = 237
34x     2d between   ███████ =  68
13x     3d between   ████ =  39
4x      4d between   ██ =  16
1x      5d between   █ =   5
```

### `code-dot-org-static.dockerfile`

Average days between changes: `2.07`  
Median days between changes: `1.00`  
Cache hit days: `52.05%`  
Cache miss days: `47.95%`

Days between file changes:

```text
102x    1d between   ████████████████████████ = 102
31x     2d between   ███████████████ =  62
14x     4d between   █████████████ =  56
15x     3d between   ███████████ =  45
5x      5d between   ██████ =  25
3x      7d between   █████ =  21
1x     20d between   █████ =  20
3x      6d between   ████ =  18
2x      8d between   ████ =  16
```

### `code-dot-org-db-seed.dockerfile`

Average days between changes: `1.39`  
Median days between changes: `1.00`  
Cache hit days: `28.49%`  
Cache miss days: `71.51%`

Days between file changes:

```text
205x    1d between   ████████████████████████ = 205
29x     3d between   ██████████ =  87
20x     2d between   █████ =  40
7x      4d between   ███ =  28
1x      5d between   █ =   5
```

### `code-dot-org-pegasus.dockerfile`

Average days between changes: `2.97`  
Median days between changes: `1.00`  
Cache hit days: `66.58%`  
Cache miss days: `33.42%`

Days between file changes:

```text
74x     1d between   ████████████████████████ =  74
21x     2d between   ██████████████ =  42
2x     13d between   ████████ =  26
1x     24d between   ████████ =  24
2x     12d between   ████████ =  24
8x      3d between   ████████ =  24
1x     23d between   ███████ =  23
1x     19d between   ██████ =  19
1x     18d between   ██████ =  18
1x     15d between   █████ =  15
1x     14d between   █████ =  14
2x      7d between   █████ =  14
2x      6d between   ████ =  12
3x      4d between   ████ =  12
1x     11d between   ████ =  11
1x      8d between   ███ =   8
1x      5d between   ██ =   5
```

### Details about each COPY pattern

#### `code-dot-org.dockerfile`

##### `OVERALL`

Average days between changes: `1.26`  
Median days between changes: `1.00`  
Cache hit days: `21.10%`  
Cache miss days: `78.90%`

Days between file changes:

```text
237x    1d between   ████████████████████████ = 237
34x     2d between   ███████ =  68
13x     3d between   ████ =  39
4x      4d between   ██ =  16
1x      5d between   █ =   5
```

##### `pegasus`

Average days between changes: `2.97`  
Median days between changes: `1.00`  
Cache hit days: `66.58%`  
Cache miss days: `33.42%`

Days between file changes:

```text
74x     1d between   ████████████████████████ =  74
21x     2d between   ██████████████ =  42
2x     13d between   ████████ =  26
1x     24d between   ████████ =  24
2x     12d between   ████████ =  24
8x      3d between   ████████ =  24
1x     23d between   ███████ =  23
1x     19d between   ██████ =  19
1x     18d between   ██████ =  18
1x     15d between   █████ =  15
1x     14d between   █████ =  14
2x      7d between   █████ =  14
2x      6d between   ████ =  12
3x      4d between   ████ =  12
1x     11d between   ████ =  11
1x      8d between   ███ =   8
1x      5d between   ██ =   5
```

##### `dashboard/app/assets`

Average days between changes: `14.60`  
Median days between changes: `5.00`  
Cache hit days: `93.42%`  
Cache miss days: `6.58%`

Days between file changes:

```text
2x     35d between   ████████████████████████ =  70
1x     59d between   ████████████████████ =  59
2x     28d between   ███████████████████ =  56
1x     54d between   ███████████████████ =  54
1x     27d between   █████████ =  27
1x     17d between   ██████ =  17
1x     16d between   █████ =  16
5x      3d between   █████ =  15
1x     11d between   ████ =  11
1x     10d between   ███ =  10
2x      5d between   ███ =  10
1x      8d between   ███ =   8
2x      4d between   ███ =   8
4x      1d between   █ =   4
```

##### `dashboard/public`

Average days between changes: `18.25`  
Median days between changes: `4.50`  
Cache hit days: `94.79%`  
Cache miss days: `5.21%`

Days between file changes:

```text
1x    112d between   ████████████████████████ = 112
1x     57d between   ████████████ =  57
1x     44d between   █████████ =  44
1x     38d between   ████████ =  38
1x     32d between   ███████ =  32
1x     22d between   █████ =  22
1x     12d between   ███ =  12
3x      4d between   ███ =  12
1x     11d between   ██ =  11
1x      8d between   ██ =   8
2x      3d between   █ =   6
1x      5d between   █ =   5
4x      1d between   █ =   4
1x      2d between   █ =   2
```

##### `apps/static`

Average days between changes: `6.76`  
Median days between changes: `3.00`  
Cache hit days: `85.48%`  
Cache miss days: `14.52%`

Days between file changes:

```text
1x     69d between   ████████████████████████ =  69
1x     36d between   █████████████ =  36
2x     16d between   ███████████ =  32
1x     27d between   █████████ =  27
8x      3d between   ████████ =  24
2x     11d between   ████████ =  22
2x     10d between   ███████ =  20
1x     19d between   ███████ =  19
9x      2d between   ██████ =  18
2x      8d between   ██████ =  16
4x      4d between   ██████ =  16
15x     1d between   █████ =  15
1x     14d between   █████ =  14
1x     12d between   ████ =  12
2x      5d between   ███ =  10
1x      9d between   ███ =   9
1x      6d between   ██ =   6
```

##### `shared/images`

Average days between changes: `36.50`  
Median days between changes: `19.50`  
Cache hit days: `97.53%`  
Cache miss days: `2.47%`

Days between file changes:

```text
1x    163d between   ████████████████████████ = 163
1x     61d between   █████████ =  61
1x     41d between   ██████ =  41
1x     27d between   ████ =  27
1x     23d between   ███ =  23
1x     16d between   ██ =  16
1x     15d between   ██ =  15
1x     14d between   ██ =  14
1x      4d between   █ =   4
1x      1d between   █ =   1
```

##### `apps/i18n`

Average days between changes: `2.61`  
Median days between changes: `2.00`  
Cache hit days: `61.92%`  
Cache miss days: `38.08%`

Days between file changes:

```text
17x     4d between   ████████████████████████ =  68
67x     1d between   ████████████████████████ =  67
25x     2d between   ██████████████████ =  50
14x     3d between   ███████████████ =  42
5x      6d between   ███████████ =  30
3x      8d between   ████████ =  24
1x     22d between   ████████ =  22
1x     21d between   ███████ =  21
3x      7d between   ███████ =  21
4x      5d between   ███████ =  20
```

##### `dashboard/config/scripts`

Average days between changes: `1.63`  
Median days between changes: `1.00`  
Cache hit days: `38.90%`  
Cache miss days: `61.10%`

Days between file changes:

```text
159x    1d between   ████████████████████████ = 159
33x     3d between   ███████████████ =  99
12x     4d between   ███████ =  48
15x     2d between   █████ =  30
4x      5d between   ███ =  20
1x      9d between   █ =   9
```

##### `dashboard/config/scripts_json`

Average days between changes: `1.55`  
Median days between changes: `1.00`  
Cache hit days: `35.62%`  
Cache miss days: `64.38%`

Days between file changes:

```text
174x    1d between   ████████████████████████ = 174
37x     3d between   ███████████████ = 111
9x      4d between   █████ =  36
13x     2d between   ████ =  26
2x      5d between   █ =  10
1x      8d between   █ =   8
```

##### `dashboard/config/levels`

Average days between changes: `1.43`  
Median days between changes: `1.00`  
Cache hit days: `30.14%`  
Cache miss days: `69.86%`

Days between file changes:

```text
198x    1d between   ████████████████████████ = 198
31x     3d between   ███████████ =  93
19x     2d between   █████ =  38
7x      4d between   ███ =  28
1x      8d between   █ =   8
```

#### `code-dot-org-static.dockerfile`

##### `OVERALL`

Average days between changes: `2.07`  
Median days between changes: `1.00`  
Cache hit days: `52.05%`  
Cache miss days: `47.95%`

Days between file changes:

```text
102x    1d between   ████████████████████████ = 102
31x     2d between   ███████████████ =  62
14x     4d between   █████████████ =  56
15x     3d between   ███████████ =  45
5x      5d between   ██████ =  25
3x      7d between   █████ =  21
1x     20d between   █████ =  20
3x      6d between   ████ =  18
2x      8d between   ████ =  16
```

##### `dashboard/app/assets`

Average days between changes: `14.60`  
Median days between changes: `5.00`  
Cache hit days: `93.42%`  
Cache miss days: `6.58%`

Days between file changes:

```text
2x     35d between   ████████████████████████ =  70
1x     59d between   ████████████████████ =  59
2x     28d between   ███████████████████ =  56
1x     54d between   ███████████████████ =  54
1x     27d between   █████████ =  27
1x     17d between   ██████ =  17
1x     16d between   █████ =  16
5x      3d between   █████ =  15
1x     11d between   ████ =  11
1x     10d between   ███ =  10
2x      5d between   ███ =  10
1x      8d between   ███ =   8
2x      4d between   ███ =   8
4x      1d between   █ =   4
```

##### `dashboard/public`

Average days between changes: `18.25`  
Median days between changes: `4.50`  
Cache hit days: `94.79%`  
Cache miss days: `5.21%`

Days between file changes:

```text
1x    112d between   ████████████████████████ = 112
1x     57d between   ████████████ =  57
1x     44d between   █████████ =  44
1x     38d between   ████████ =  38
1x     32d between   ███████ =  32
1x     22d between   █████ =  22
1x     12d between   ███ =  12
3x      4d between   ███ =  12
1x     11d between   ██ =  11
1x      8d between   ██ =   8
2x      3d between   █ =   6
1x      5d between   █ =   5
4x      1d between   █ =   4
1x      2d between   █ =   2
```

##### `apps/static`

Average days between changes: `6.76`  
Median days between changes: `3.00`  
Cache hit days: `85.48%`  
Cache miss days: `14.52%`

Days between file changes:

```text
1x     69d between   ████████████████████████ =  69
1x     36d between   █████████████ =  36
2x     16d between   ███████████ =  32
1x     27d between   █████████ =  27
8x      3d between   ████████ =  24
2x     11d between   ████████ =  22
2x     10d between   ███████ =  20
1x     19d between   ███████ =  19
9x      2d between   ██████ =  18
2x      8d between   ██████ =  16
4x      4d between   ██████ =  16
15x     1d between   █████ =  15
1x     14d between   █████ =  14
1x     12d between   ████ =  12
2x      5d between   ███ =  10
1x      9d between   ███ =   9
1x      6d between   ██ =   6
```

##### `shared/images`

Average days between changes: `36.50`  
Median days between changes: `19.50`  
Cache hit days: `97.53%`  
Cache miss days: `2.47%`

Days between file changes:

```text
1x    163d between   ████████████████████████ = 163
1x     61d between   █████████ =  61
1x     41d between   ██████ =  41
1x     27d between   ████ =  27
1x     23d between   ███ =  23
1x     16d between   ██ =  16
1x     15d between   ██ =  15
1x     14d between   ██ =  14
1x      4d between   █ =   4
1x      1d between   █ =   1
```

##### `apps/i18n`

Average days between changes: `2.61`  
Median days between changes: `2.00`  
Cache hit days: `61.92%`  
Cache miss days: `38.08%`

Days between file changes:

```text
17x     4d between   ████████████████████████ =  68
67x     1d between   ████████████████████████ =  67
25x     2d between   ██████████████████ =  50
14x     3d between   ███████████████ =  42
5x      6d between   ███████████ =  30
3x      8d between   ████████ =  24
1x     22d between   ████████ =  22
1x     21d between   ███████ =  21
3x      7d between   ███████ =  21
4x      5d between   ███████ =  20
```

#### `code-dot-org-db-seed.dockerfile`

##### `OVERALL`

Average days between changes: `1.39`  
Median days between changes: `1.00`  
Cache hit days: `28.49%`  
Cache miss days: `71.51%`

Days between file changes:

```text
205x    1d between   ████████████████████████ = 205
29x     3d between   ██████████ =  87
20x     2d between   █████ =  40
7x      4d between   ███ =  28
1x      5d between   █ =   5
```

##### `dashboard/config/scripts`

Average days between changes: `1.63`  
Median days between changes: `1.00`  
Cache hit days: `38.90%`  
Cache miss days: `61.10%`

Days between file changes:

```text
159x    1d between   ████████████████████████ = 159
33x     3d between   ███████████████ =  99
12x     4d between   ███████ =  48
15x     2d between   █████ =  30
4x      5d between   ███ =  20
1x      9d between   █ =   9
```

##### `dashboard/config/scripts_json`

Average days between changes: `1.55`  
Median days between changes: `1.00`  
Cache hit days: `35.62%`  
Cache miss days: `64.38%`

Days between file changes:

```text
174x    1d between   ████████████████████████ = 174
37x     3d between   ███████████████ = 111
9x      4d between   █████ =  36
13x     2d between   ████ =  26
2x      5d between   █ =  10
1x      8d between   █ =   8
```

##### `dashboard/config/levels`

Average days between changes: `1.43`  
Median days between changes: `1.00`  
Cache hit days: `30.14%`  
Cache miss days: `69.86%`

Days between file changes:

```text
198x    1d between   ████████████████████████ = 198
31x     3d between   ███████████ =  93
19x     2d between   █████ =  38
7x      4d between   ███ =  28
1x      8d between   █ =   8
```

#### `code-dot-org-pegasus.dockerfile`

##### `OVERALL`

Average days between changes: `2.97`  
Median days between changes: `1.00`  
Cache hit days: `66.58%`  
Cache miss days: `33.42%`

Days between file changes:

```text
74x     1d between   ████████████████████████ =  74
21x     2d between   ██████████████ =  42
2x     13d between   ████████ =  26
1x     24d between   ████████ =  24
2x     12d between   ████████ =  24
8x      3d between   ████████ =  24
1x     23d between   ███████ =  23
1x     19d between   ██████ =  19
1x     18d between   ██████ =  18
1x     15d between   █████ =  15
1x     14d between   █████ =  14
2x      7d between   █████ =  14
2x      6d between   ████ =  12
3x      4d between   ████ =  12
1x     11d between   ████ =  11
1x      8d between   ███ =   8
1x      5d between   ██ =   5
```

##### `pegasus`

Average days between changes: `2.97`  
Median days between changes: `1.00`  
Cache hit days: `66.58%`  
Cache miss days: `33.42%`

Days between file changes:

```text
74x     1d between   ████████████████████████ =  74
21x     2d between   ██████████████ =  42
2x     13d between   ████████ =  26
1x     24d between   ████████ =  24
2x     12d between   ████████ =  24
8x      3d between   ████████ =  24
1x     23d between   ███████ =  23
1x     19d between   ██████ =  19
1x     18d between   ██████ =  18
1x     15d between   █████ =  15
1x     14d between   █████ =  14
2x      7d between   █████ =  14
2x      6d between   ████ =  12
3x      4d between   ████ =  12
1x     11d between   ████ =  11
1x      8d between   ███ =   8
1x      5d between   ██ =   5
```

