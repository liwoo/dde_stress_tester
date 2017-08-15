const settings = require('../settings.json');
const bulk_loader = require('./lib/bulk_loader');

const ip = process.argv[2];
const records = Number(process.argv[3]);
const from = Number(process.argv[4]);
const target_site_code = Number(process.argv[5]);

const couch_port = settings.couchPort;
const elastic_port = settings.elasticPort;
const chunk = Number(settings.chunk);
const person_db = 'dde_person_' + target_site_code;
const npid_db = 'dde_' + target_site_code;
const couch_person_url = `http://${ip}:${couch_port}/${person_db}/_bulk_docs`;
const couch_npid_url = `http://${ip}:${couch_port}/${npid_db}/_bulk_docs`;
const elastic_url = `http://${ip}:${elastic_port}/_bulk`;
const start = Math.floor(from / chunk);
const end = Math.ceil(records / chunk);

bulk_loader(start, end, chunk, couch_npid_url, couch_person_url, elastic_port);