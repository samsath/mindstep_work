import { invisibleScore } from '../index.js'; // replace `your-file` with the actual file path exporting your function
import {  normalize } from '../util.js';
import jest from "jest";


describe('invisibleScore', () => {
    const FEMALE_WEIGHTING = 8;
    const MALE_WEIGHTING = 5;
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = {
            MALE_WEIGHTING: `${MALE_WEIGHTING}`,
            FEMALE_WEIGHTING: `${FEMALE_WEIGHTING}`
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    })


    it('should handle scores for female', () => {

        const gender = 'female', age = 20, score = 80;
        const minValue = FEMALE_WEIGHTING * (0 - age);
        const maxValue = FEMALE_WEIGHTING * (100 - age)
        const weightedValue = FEMALE_WEIGHTING * (score - age)
        const expectedOutput = normalize(weightedValue, minValue, maxValue, 0, 100);
        const responseScore = invisibleScore(gender, age, score);
        expect(responseScore).toBe(expectedOutput);
        expect(responseScore).toBeLessThanOrEqual(100);
        expect(responseScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle scores for male', () => {
        const gender = 'male', age = 30, score = 50;
        const minValue = MALE_WEIGHTING * (0 - age);
        const maxValue = MALE_WEIGHTING * (100 - age)
        const weightedValue = MALE_WEIGHTING * (score - age)
        const expectedOutput = normalize(weightedValue, minValue, maxValue, 0, 100);

        const responseScore = invisibleScore(gender, age, score);
        expect(responseScore).toBe(expectedOutput);
        expect(responseScore).toBeLessThanOrEqual(100);
        expect(responseScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle scores for male with small age', () => {
        const gender = 'male', age = 2, score = 50;
        const minValue = MALE_WEIGHTING * (0 - age);
        const maxValue = MALE_WEIGHTING * (100 - age)
        const weightedValue = MALE_WEIGHTING * (score - age)
        const expectedOutput = normalize(weightedValue, minValue, maxValue, 0, 100);

        const responseScore = invisibleScore(gender, age, score);
        expect(responseScore).toBe(expectedOutput);
        expect(responseScore).toBeLessThanOrEqual(100);
        expect(responseScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle scores for female with large age', () => {
        const gender = 'female', age = 90, score = 80;
        const minValue = FEMALE_WEIGHTING * (0 - age);
        const maxValue = FEMALE_WEIGHTING * (100 - age)
        const weightedValue = FEMALE_WEIGHTING * (score - age)
        const expectedOutput = normalize(weightedValue, minValue, maxValue, 0, 100);

        const responseScore = invisibleScore(gender, age, score);
        expect(responseScore).toBe(expectedOutput);
        expect(responseScore).toBeLessThanOrEqual(100);
        expect(responseScore).toBeGreaterThanOrEqual(0);
    });
});