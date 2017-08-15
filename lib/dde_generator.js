const npid = require('../dependencies/national_patient_id_lite');
const casual = require('casual');
const _ = require('lodash');
const faker = require('faker');

module.exports = function dde_generator(iterator, chunks) {
    let npid_data = [];
    let person_data = [];
    let elastic_data = [];
    let elastic_bulk_data = [];

    const site_code = _.first(_.shuffle(["KCH", "MPC", "A18", "A25"])).toLowerCase();
    const start = chunks * iterator + 1;
    const end = (iterator + 1) * chunks;

    for (let i = start; i <= end; i++) {
        const id = npid.init(i);
        const region = _.first(_.shuffle(["Centre", "South", "North"]));
        const birthdate_estimate = 0;
        const birthdate = casual.date('YYYY-MM-DD');

        const npid_record = {
            "_id": String(i),
            "date_created": Date.now(),
            "national_id": id,
            "assigned": true,
            "region": region,
            "site_code": site_code,
            "type": "Npid"
        };
        npid_data.push(npid_record);

        const person_record = {
            "_id": id,
            "addresses": {
                "current_residence": casual.street,
                "current_village": casual.street,
                "current_ta": casual.city,
                "current_district": casual.state,
                "home_village": casual.street,
                "home_ta": casual.city,
                "home_district": casual.state
            },
            "attributes": {
                "occupation": faker.name.jobTitle(),
                "cell_phone_number": casual.phone
            },
            "birthdate": birthdate,
            "birthdate_estimated": birthdate_estimate,
            "created_at": Date.now(),
            "gender": _.first(_.shuffle(["F", "M"])),
            "names": {
                "family_name": casual.last_name,
                "given_name": casual.first_name,
                "middle_name": _.first(_.shuffle([casual.first_name, null]))
            },
            "site_code": site_code,
            "type": "Person"
        };
        person_data.push(person_record);

        const footprint_record = {
            "application": _.first(_.shuffle(['art', 'anc', 'opd', 'hts'])),
            "created_at": Date.now(),
            "npid": id,
            "temp_id": i,
            "origin": site_code,
            "site_code": site_code,
            "type": "Footprint",
            "updated_at": Date.now()
        };
        person_data.push(footprint_record);

        /******************* ELASTIC SEARCH STUFF HERE *****************/
        const elastic_npid_index = {
            "index": {
                "_index": "dde",
                "_type": "npids",
                "_id": i
            }
        };

        const elastic_person_index = {
            "index": {
                "_index": "dde",
                "_type": "person",
                "_id": id
            }
        };

        const elastic_footprint_index = {
            "index": {
                "_index": "dde",
                "_type": "footprint",
                "_id": i
            }
        };

        const elastic_npid_data = _.omit(npid_record, ['_id']);
        const elastic_person_data = _.omit(person_record, ['_id']);
        const elastic_footprint_data = _.omit(footprint_record, ['_id']);

        elastic_bulk_data.push(JSON.stringify(elastic_npid_index));
        elastic_bulk_data.push(JSON.stringify(elastic_npid_data));

        elastic_bulk_data.push(JSON.stringify(elastic_footprint_index));
        elastic_bulk_data.push(JSON.stringify(elastic_footprint_data));

        elastic_bulk_data.push(JSON.stringify(elastic_person_index));
        elastic_bulk_data.push(JSON.stringify(elastic_person_data));

        console.log(`Done populating ${i} of ${end}`);
    }

    elastic_data.push(elastic_bulk_data.join('\n') + '\n');

    return {
        npid: npid_data,
        person: person_data,
        elastic: elastic_data,
        start: start,
        end: end
    };
};