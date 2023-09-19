import { flattenObject, toCSVFormat, normalize, CSVtoJson } from '../util.js';

// Test Flatten Object Function
describe('flattenObject function', () => {
    it('should flatten an object with nested objects', () => {
        const nestedObject = {
            a: 1,
            b: {
                c: 2,
                d: 3,
            },
        };

        expect(flattenObject(nestedObject)).toEqual({
            a: 1,
            'b_c': 2,
            'b_d': 3,
        });
    });

    it('should handle non-nested objects', () => {
        const nonNestedObject = {
            a: 1,
            b: 2,
        };

        expect(flattenObject(nonNestedObject)).toEqual(nonNestedObject);
    });
});

// Test to CSV Format Function
describe('toCSVFormat function', () => {
    it('should format JSON data as CSV', () => {
        const jsonData = {
            a: 1,
            b: 2,
        };

        expect(toCSVFormat(jsonData)).toEqual(`a\tb\r\n"1"\t"2"`);
    });

    it('should handle JSON data with nested objects', () => {
        const nestedJsonData = {
            a: 1,
            b: {
                c: 2,
                d: 3,
            },
        };

        expect(toCSVFormat(nestedJsonData)).toEqual(`a\tb_c\tb_d\r\n"1"\t"2"\t"3"`);
    });
});

describe('CSVtoJson', () => {
    it('converts CSV data to JSON format', () => {
        const csvData = 'a\tb\tc\n1\t2\t3\n4\t5\t6';
        const expectedOutput = [
            { a: '1', b: '2', c: '3' },
            { a: '4', b: '5', c: '6' },
        ];
        expect(CSVtoJson(csvData)).toEqual(expectedOutput);
    });
    it('convert real data to JSON', () => {
        const csvData = 'gender\tname_title\tname_first\tname_last\tlocation_street_number\tlocation_street_name\tlocation_city\tlocation_state\tlocation_country\tlocation_postcode\tlocation_coordinates_latitude\tlocation_coordinates_longitude\tlocation_timezone_offset\tlocation_timezone_description\temail\tlogin_uuid\tlogin_username\tlogin_password\tlogin_salt\tlogin_md5\tlogin_sha1\tlogin_sha256\tdob_date\tdob_age\tregistered_date\tregistered_age\tphone\tcell\tid_name\tid_value\tpicture_large\tpicture_medium\tpicture_thumbnail\tnat\tinvisible_level\tinvisible_status\tsuperhero\n"male"\t"Mr"\t"Eetu"\t"Annala"\t"1542"\t"Suvantokatu"\t"Heinola"\t"Tavastia Proper"\t"Finland"\t"21637"\t"-21.8299"\t"-101.5631"\t"+1:00"\t"Brussels, Copenhagen, Madrid, Paris"\t"eetu.annala@example.com"\t"3072d1d2-85b9-4e95-951c-1c0853a256f5"\t"bigrabbit180"\t"enigma"\t"FwRK6Jwv"\t"2d45c15566f74b583d3450972fc2d38c"\t"1173a3160899a19d8ea3a47571d9ba24db88cc4b"\t"3c1246b6239f7750f5987152f5ecb228f8a95a07fd1cf1afcbcedcef1bb8e83a"\t"1987-08-08T15:29:24.823Z"\t"36"\t"2002-10-06T03:34:38.227Z"\t"20"\t"04-161-339"\t"043-570-68-58"\t"HETU"\t"NaNNA005undefined"\t"https://randomuser.me/api/portraits/men/54.jpg"\t"https://randomuser.me/api/portraits/med/men/54.jpg"\t"https://randomuser.me/api/portraits/thumb/men/54.jpg"\t"FI"\t"66"\t"Transparent"\t"66"';
        const expectedOutput = [
            {
                gender: "male",
                name_title: "Mr",
                name_first: "Eetu",
                name_last: "Annala",
                location_street_number: "1542",
                location_street_name: "Suvantokatu",
                location_city: "Heinola",
                location_state: "Tavastia Proper",
                location_country: "Finland",
                location_postcode: "21637",
                location_coordinates_latitude: "-21.8299",
                location_coordinates_longitude: "-101.5631",
                location_timezone_offset: "+1:00",
                location_timezone_description: "Brussels, Copenhagen, Madrid, Paris",
                email: "eetu.annala@example.com",
                login_uuid: "3072d1d2-85b9-4e95-951c-1c0853a256f5",
                login_username: "bigrabbit180",
                login_password: "enigma",
                login_salt: "FwRK6Jwv",
                login_md5: "2d45c15566f74b583d3450972fc2d38c",
                login_sha1: "1173a3160899a19d8ea3a47571d9ba24db88cc4b",
                login_sha256: "3c1246b6239f7750f5987152f5ecb228f8a95a07fd1cf1afcbcedcef1bb8e83a",
                dob_date: "1987-08-08T15:29:24.823Z",
                dob_age: "36",
                registered_date: "2002-10-06T03:34:38.227Z",
                registered_age: "20",
                phone: "04-161-339",
                cell: "043-570-68-58",
                id_name: "HETU",
                id_value: "NaNNA005undefined",
                picture_large: "https://randomuser.me/api/portraits/men/54.jpg",
                picture_medium: "https://randomuser.me/api/portraits/med/men/54.jpg",
                picture_thumbnail: "https://randomuser.me/api/portraits/thumb/men/54.jpg",
                nat: "FI",
                invisible_level: "66",
                invisible_status: "Transparent",
                superhero: "66",
            },
            ]
        expect(CSVtoJson(csvData)).toEqual(expectedOutput);
    });
});


describe('normalize function', () =>  {
    it('should normalize the number within given bounds', () => {
        expect(normalize(5, 0, 10, 0, 100)).toBe(50);
        expect(normalize(15, 0, 20, 0, 100)).toBe(75);
        expect(normalize(10, 1, 30, 0, 10)).toBe(3);
    });

    it('should return 0 if value is less than min', () => {
        expect(normalize(-5, -10, 10, 0, 10)).toBe(3);
    });

    it('should return 1 if value is more than max', () => {
        expect(normalize(35, 0, 30, 0, 10)).toBe(12);
    });

    it('should handle edge cases', () => {
        // Assuming 0 to be default min and max values
        expect(normalize(NaN, 0, 0, 0, 0)).toBeNaN(); // NaN - Not a Number
        expect(normalize(Infinity, 0, 0, 0 ,10)).toBe(Infinity); // Infinity
        expect(normalize(-Infinity, 0, 0, 0, 10)).toBe(-Infinity); // -Infinity
    });
});