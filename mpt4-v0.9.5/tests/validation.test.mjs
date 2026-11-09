import test from 'node:test'; import assert from 'node:assert/strict';
import {validateMark,validateHeaders,findDuplicateIds} from '../modules/validation.js';
test('integer and T accepted; blank skipped',()=>{assert.deepEqual(validateMark('10',10),{status:'VALID',value:'10'});assert.deepEqual(validateMark('T',10),{status:'VALID',value:'T'});assert.equal(validateMark('',10).status,'EMPTY');});
test('reject decimal, lowercase t and over maximum',()=>{assert.equal(validateMark('1.5',10).status,'INVALID_FORMAT');assert.equal(validateMark('t',10).status,'INVALID_FORMAT');assert.equal(validateMark('11',10).status,'OUT_OF_RANGE');});
test('header requirements and duplicate IDs',()=>{assert.equal(validateHeaders(['Student ID','Student Name'],['Student ID','Student Name']).ok,true);assert.deepEqual(findDuplicateIds([{'Student ID':'001'},{'Student ID':'001'}]),['001']);});
