# jpeg-exif-stats

## Info

A rudimentary script to parse image files within a folder and extract exif information into a csv.
Currently only supports `.JPG` files (case sensitive) and only extracts focal length and aperture.

## Usage

1. Clone the repository
2. `npm ci`
3. Modify the directory in the `start` command to point to your photos directory
4. Create the `output` folder in the root of the project directory
5. Run via `npm start`