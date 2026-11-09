export const PROFILES = {
  '041': { name: 'Bahasa Melayu', components: [
    ['Bahagian A',10], ['Bahagian B',10], ['Bahagian C',10], ['Bahagian D',20]
  ]},
  '043': { name: 'Bahasa Inggeris', components: [
    ['Part 1',6], ['Part 2',7], ['Part 3',7], ['Part 4',7], ['Part 5',8], ['Part 6',15]
  ]},
  '045': { name: 'Matematik', components: [
    ['Bahagian A (Soalan 1-6)',11], ['Bahagian A (Soalan 7)',2], ['Bahagian A (Soalan 8-12)',11], ['Bahagian A (Soalan 13)',2], ['Bahagian B (Soalan 14-15)',24]
  ]},
  '048': { name: 'Sains', components: [
    ['Bahagian A',21], ['Bahagian B',9], ['Bahagian C',20]
  ]}
};
export const headersFor = code => ['Student ID','Student Name', ...(PROFILES[code]?.components.map(x=>x[0]) || [])];
