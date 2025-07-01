import * as Yup from 'yup'
import _ from 'lodash'

export type ProfileSectionKey = 'personal' | 'family' | 'spiritual' | 'preferences' | 'images' | 'payment'

// Helper arrays for dynamic options
const jobTypeOptions = [
  'Student',
  'Software Engineer',
  'Doctor',
  'Teacher',
  'Business Owner',
  'Government Employee',
  'Private Employee',
  'Farmer',
  'Homemaker',
  'Retired',
  'Unemployed',
  'Other',
]

const heightOptions = []
for (let feet = 4; feet <= 7; feet++) {
  for (let inches = 0; inches <= 11; inches++) {
    const totalInches = feet * 12 + inches
    if (totalInches >= 48 && totalInches <= 84) { // 4'0" to 7'0"
      heightOptions.push(`${feet}'${inches}"`)
    }
  }
}

const weightOptions = []
for (let weight = 40; weight <= 120; weight += 5) {
  weightOptions.push(`${weight} kg`)
}
weightOptions.push('Above 120 kg')

const complexionOptions = [
  'Very Fair',
  'Fair',
  'Wheatish',
  'Medium',
  'Dark',
  'Very Dark',
]

const incomeOptions = [
  'Below 1L',
  '1L-3L',
  '3L-5L',
  '5L-7L',
  '7L-10L',
  '10L-15L',
  '15L-20L',
  '20L-25L',
  '25L-30L',
  'Above 30L',
]

// Age options for preferences
const ageOptions = []
for (let age = 18; age <= 60; age++) {
  ageOptions.push(age.toString())
}

// State options
const stateOptions = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry',
  'Chandigarh', 'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep', 'Ladakh', 'Jammu and Kashmir'
]

export const PROFILE_SECTIONS_ORDER: ProfileSectionKey[] = ['personal', 'family', 'spiritual', 'preferences', 'images', 'payment']

export const fieldSelectOptions: Record<string, string[]> = {
  profileCreatedFor: ['Self', 'Son', 'Daughter', 'Brother', 'Sister', 'Relative', 'Friend', 'Other'],
  gender: ['Male', 'Female', 'Other'],
  martialStatus: ['Single', 'Married', 'Divorced', 'Widowed', 'Annulled', 'Other'],
  education: [
    'High School',
    'Diploma',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Professional Degree',
    'Other',
  ],
  jobType: jobTypeOptions,
  income: incomeOptions,
  height: heightOptions,
  weight: weightOptions,
  complexion: complexionOptions,
  motherTongue: [
    'Tamil',
    'English',
    'Hindi',
    'Kannada',
    'Telugu',
    'Malayalam',
    'Marathi',
    'Gujarati',
    'Punjabi',
    'Urdu',
    'Other',
  ],
  fatherOccupation: [..._.without(jobTypeOptions, 'Student')],
  motherOccupation: [..._.without(jobTypeOptions, 'Student')],
  familyType: ['Nuclear', 'Joint', 'Extended', 'Other'],
  areYouSaved: ['Yes', 'No'],
  areYouBaptized: ['Yes', 'No'],
  areYouAnointed: ['Yes', 'No'],
  denomination: ['Pentecostal', 'Catholic', 'Protestant', 'Orthodox', 'Other'],
  exMinAge: ageOptions,
  exMaxAge: ageOptions,
  exEducation: ['Any', 'High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Professional Degree', 'Other'],
  exJobType: ['Any', ...jobTypeOptions],
  exIncome: ['Any', ...incomeOptions],
  exComplexion: ['Any', ...complexionOptions],
  state: stateOptions,
}

export const profileSections = {
  personal: {
    title: 'Primary Details',
    fields: [
      'profileCreatedFor',
      'name',
      'about',
      'gender',
      'dateOfBirth',
      'martialStatus',
      'education',
      'jobType',
      'jobTitle',
      'income',
      'height',
      'weight',
      'complexion',
      'mobileNumber',
      'nativePlace',
      'motherTongue',
    ],
    validationSchema: Yup.object().shape({
      profileCreatedFor: Yup.string()
        .oneOf(fieldSelectOptions.profileCreatedFor, 'Invalid selection')
        .required('Profile Created For is required'),
      name: Yup.string().required('Name is required'),
      about: Yup.string(),
      gender: Yup.string()
        .oneOf(fieldSelectOptions.gender, 'Invalid gender')
        .required('Gender is required'),
      dateOfBirth: Yup.string()
        .required('Date of Birth is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date'),
      martialStatus: Yup.string()
        .oneOf(fieldSelectOptions.martialStatus, 'Invalid martial status')
        .required('Martial Status is required'),
      education: Yup.string()
        .oneOf(fieldSelectOptions.education, 'Invalid education')
        .required('Education is required'),
      jobType: Yup.string()
        .oneOf(fieldSelectOptions.jobType, 'Invalid job type')
        .required('Job Type is required'),
      jobTitle: Yup.string().required('Job Title is required'),
      income: Yup.string()
        .oneOf(fieldSelectOptions.income, 'Invalid income')
        .required('Income is required'),
      height: Yup.string()
        .oneOf(fieldSelectOptions.height, 'Invalid height')
        .required('Height is required'),
      weight: Yup.string()
        .oneOf(fieldSelectOptions.weight, 'Invalid weight')
        .required('Weight is required'),
      complexion: Yup.string()
        .oneOf(fieldSelectOptions.complexion, 'Invalid complexion')
        .required('Complexion is required'),
      mobileNumber: Yup.string().required('Mobile Number is required'),
      nativePlace: Yup.string().required('Native Place is required'),
      motherTongue: Yup.string()
        .oneOf(fieldSelectOptions.motherTongue, 'Invalid mother tongue')
        .required('Mother Tongue is required'),
    }),
  },
  family: {
    title: 'Family Details',
    fields: [
      'fatherName',
      'fatherOccupation',
      'motherName',
      'motherOccupation',
      'familyType',
      'currentAddress',
      'youngerBrothers',
      'youngerSisters',
      'elderBrothers',
      'elderSisters',
      'youngerBrothersMarried',
      'youngerSistersMarried',
      'elderBrothersMarried',
      'elderSistersMarried',
    ],
    validationSchema: Yup.object().shape({
      fatherName: Yup.string().required("Father's Name is required"),
      fatherOccupation: Yup.string().required("Father's Occupation is required"),
      motherName: Yup.string().required("Mother's Name is required"),
      motherOccupation: Yup.string().required("Mother's Occupation is required"),
      familyType: Yup.string()
        .oneOf(fieldSelectOptions.familyType, 'Invalid family type')
        .required('Family Type is required'),
      currentAddress: Yup.object().shape({
        street: Yup.string().required('Street is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string()
          .oneOf(fieldSelectOptions.state, 'Invalid state')
          .required('State is required'),
        pincode: Yup.string().required('Pincode is required'),
      }),
      youngerBrothers: Yup.number().min(0).required('Required'),
      youngerSisters: Yup.number().min(0).required('Required'),
      elderBrothers: Yup.number().min(0).required('Required'),
      elderSisters: Yup.number().min(0).required('Required'),
      youngerBrothersMarried: Yup.number()
        .min(0)
        .required('Required')
        .test('younger-brothers-married', 'Married count cannot exceed total count', function(value) {
          const { youngerBrothers } = this.parent
          return !value || !youngerBrothers || value <= youngerBrothers
        }),
      youngerSistersMarried: Yup.number()
        .min(0)
        .required('Required')
        .test('younger-sisters-married', 'Married count cannot exceed total count', function(value) {
          const { youngerSisters } = this.parent
          return !value || !youngerSisters || value <= youngerSisters
        }),
      elderBrothersMarried: Yup.number()
        .min(0)
        .required('Required')
        .test('elder-brothers-married', 'Married count cannot exceed total count', function(value) {
          const { elderBrothers } = this.parent
          return !value || !elderBrothers || value <= elderBrothers
        }),
      elderSistersMarried: Yup.number()
        .min(0)
        .required('Required')
        .test('elder-sisters-married', 'Married count cannot exceed total count', function(value) {
          const { elderSisters } = this.parent
          return !value || !elderSisters || value <= elderSisters
        }),
    }),
  },
  spiritual: {
    title: 'Spiritual Details',
    fields: [
      'areYouSaved',
      'areYouBaptized',
      'areYouAnointed',
      'churchName',
      'denomination',
      'pastorName',
      'pastorMobileNumber',
      'churchAddress',
    ],
    validationSchema: Yup.object().shape({
      areYouSaved: Yup.string()
        .oneOf(fieldSelectOptions.areYouSaved, 'Invalid are you saved')
        .required('This field is required'),
      areYouBaptized: Yup.string()
        .oneOf(fieldSelectOptions.areYouBaptized, 'Invalid are you baptized')
        .required('This field is required'),
      areYouAnointed: Yup.string()
        .oneOf(fieldSelectOptions.areYouAnointed, 'Invalid are you anointed')
        .required('This field is required'),
      churchName: Yup.string().required('Church Name is required'),
      denomination: Yup.string()
        .oneOf(fieldSelectOptions.denomination, 'Invalid denomination')
        .required('Denomination is required'),
      pastorName: Yup.string().required('Pastor Name is required'),
      pastorMobileNumber: Yup.string().required('Pastor Mobile Number is required'),
      churchAddress: Yup.object().shape({
        street: Yup.string().required('Street is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string().required('State is required'),
        pincode: Yup.string().required('Pincode is required'),
      }),
    }),
  },
  preferences: {
    title: 'Partner Preferences',
    fields: [
      'exMinAge',
      'exMaxAge',
      'exEducation',
      'exJobType',
      'exIncome',
      'exComplexion',
      'exOtherDetails',
    ],
    validationSchema: Yup.object().shape({
      exMinAge: Yup.string()
        .oneOf(fieldSelectOptions.exMinAge, 'Invalid minimum age')
        .required('Minimum Age is required'),
      exMaxAge: Yup.string()
        .oneOf(fieldSelectOptions.exMaxAge, 'Invalid maximum age')
        .required('Maximum Age is required'),
      exEducation: Yup.string()
        .oneOf(fieldSelectOptions.exEducation, 'Invalid education')
        .required('Education is required'),
      exJobType: Yup.string()
        .oneOf(fieldSelectOptions.exJobType, 'Invalid job type')
        .required('Job Type is required'),
      exIncome: Yup.string()
        .oneOf(fieldSelectOptions.exIncome, 'Invalid income')
        .required('Income is required'),
      exComplexion: Yup.string()
        .oneOf(fieldSelectOptions.exComplexion, 'Invalid complexion')
        .required('Complexion is required'),
      exOtherDetails: Yup.string(),
    }),
  },
  images: {
    title: 'Photos',
    fields: ['gallery', 'profilePictureIndex'],
    validationSchema: Yup.object().shape({
      gallery: Yup.array()
        .of(
          Yup.object().shape({
            data: Yup.string().required('Data is required'),
            dimensions: Yup.object().shape({
              width: Yup.number().required('Width is required'),
              height: Yup.number().required('Height is required'),
            }),
          })
        )
        .min(1, 'At least one photo is required')
        .required('Gallery is required'),
      profilePictureIndex: Yup.number().min(0),
    }),
  },
  payment: {
    title: 'Payment',
    fields: [],
    validationSchema: Yup.object().shape({}),
  },
}

 