import baseFs from 'fs';
import ExifReader from 'exifreader';
import { chunkPromise, PromiseFlavor } from 'chunk-promise';
import { Parser } from 'json2csv';
import printProgress from './helpers/printProgressHelper';

const fs = baseFs.promises;

const fileDir = process.argv[2] || 'test';
console.log(`Reading files from: ${fileDir}`);

const scanFiles = async (dir) => {
  const items = await fs.readdir(dir);

  const withInfo = await Promise.all(items.map(async path => {
    const stat = await fs.lstat(`${dir}/${path}`);
    return {
      path: `${dir}/${path}`,
      file: stat.isFile(),
    }
  }));

  const dirsToCheck = withInfo.filter(x => !x.file).map(x => x.path);
  const subFiles = await Promise.all(dirsToCheck.map(async path => scanFiles(path)));

  const localFiles = withInfo.filter(x => x.file).map(x => x.path);

  const allFiles = [].concat.apply([], [localFiles, ...subFiles]);
  return allFiles;
}

const getShotInfo = async (path, { onFinished }) => {
  try {
    const file = await fs.readFile(path);
    const tags = ExifReader.load(file);
    const focalLength = tags['FocalLength'].value;
    const aperture = tags['ApertureValue'].value;

    onFinished();

    return {
      focalLength,
      aperture,
    };
  } catch (err) {
    console.log('Error processing file:', path);
    onFinished();
  }
}

async function main() {

  console.log('\r\n Scanning for files... ')
  const files = await scanFiles(fileDir);
  console.log(`${files.length} files found`);

  console.log('\r\nFiltering down to "JPG"');
  const filteredFiles = files.filter(x => x.indexOf('.JPG') >= 0);
  console.log(`${filteredFiles.length} JPG files found`);

  console.log('\r\n \r\n')

  const total = filteredFiles.length;
  let current = 0;
  const track = () => {
    current += 1;
    printProgress('Processing Photos', current, total, current === total);
  };

  const info = await chunkPromise(filteredFiles.map(file => () => getShotInfo(file, { onFinished: track })), { concurrent: 20, promiseFlavor: PromiseFlavor.PromiseAll});

  const parser = new Parser({ fields: ['focalLength', 'aperture'] });
  const csv = parser.parse(info.filter(row => !!row));

  await fs.writeFile('output/data.csv', csv);
}

main();
