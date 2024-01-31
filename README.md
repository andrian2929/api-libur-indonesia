## API Hari Libur Idonesia

Beberapa fitur dalam API ini adalah
- Data hari libur berdasarkan tahun
- Data hari libur berdasarkan tahun dan bulan
- Cek apakah tanggal merupakan hari libur atau tidak

### `GET /holiday/2024`
Mendapatkan data hari libur berdasarkan `tahun` pada parameter
  ```json
  {
    "year": 2023,
    "isOfficial": true,
    "count": 27,
    "holidays": [
        {
            "date": "2023-01-01",
            "day": "Minggu",
            "name": "Tahun Baru Masehi"
        },
        {
            "date": "2023-01-22",
            "day": "Minggu",
            "name": "Tahun Baru Imlek"
        }
    ]
  }
 ```
 `isOffical` _menunjukkan apakah data tersebut resmi dari pemerintah Indonesia_

<br>
 
### `GET /holiday/2024/01`
Mendapatkan data hari libur berdasarkan `tahun`  dan `bulan`
  ```json
  {
    "success": true,
    "data": {
        "count": 3,
        "isOfficial": true,
        "holidays": [
            {
                "date": "2023-01-01",
                "day": "Minggu",
                "name": "Tahun Baru Masehi"
            },
            {
                "date": "2023-01-22",
                "day": "Minggu",
                "name": "Tahun Baru Imlek"
            },
            {
                "date": "2023-01-23",
                "day": "Senin",
                "name": "Cuti Bersama Tahun Baru Imlek"
            }
        ]
    }
}
 ```
 `isOffical` _menunjukkan apakah data tersebut resmi dari pemerintah Indonesia_

<br>

**Made with ❤️ by Aan**

