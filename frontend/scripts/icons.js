const fs = require('fs');
const glob = require('glob');
const cheerio = require('cheerio');
const assign = require('object-assign');

function parse(contents, opt) {
  opt = opt || {};
  const $ = cheerio.load(contents, assign({ xmlMode: true }, opt));

  let fullpath = '';

  $('path').each(function () {
    const d = $(this).attr('d');
    fullpath += `${d.replace(/\s+/g, ' ')} `;
  });

  return {
    viewBox: $('svg').attr('viewBox'),
    paths: fullpath.trim(),
  };
}

function extract(file, opt) {
  opt = opt || {};

  if (!opt.encoding) {
    opt.encoding = 'utf8';
  }

  const contents = fs.readFileSync(file, opt.encoding);
  return parse(contents, opt);
}

function getName(path) {
  const splited = path.split('/');
  return splited[splited.length - 1].replace('.svg', '');
}

function gen(path, icons) {
  return glob.sync(`${path}/*.svg`).reduce((memo, current) => {
    const name = getName(current);
    const svg = extract(current);

    return Object.assign(memo, { [name]: svg });
  }, icons);
}

const icons = gen(`${__dirname}/../assets/icons`, {});

fs.writeFileSync(`${__dirname}/../src/components/Icons/map.json`, JSON.stringify(icons));
