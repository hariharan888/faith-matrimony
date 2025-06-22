import * as Yup from 'yup'

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

const heightOptions = [
  'Below 4ft',
  '4ft 1in',
  '4ft 2in',
  '4ft 3in',
  '4ft 4in',
  '4ft 5in',
  '4ft 6in',
  '4ft 7in',
  '4ft 8in',
  '4ft 9in',
  '4ft 10in',
  '4ft 11in',
  '5ft',
  '5ft 1in',
  '5ft 2in',
  '5ft 3in',
  '5ft 4in',
  '5ft 5in',
  '5ft 6in',
  '5ft 7in',
  '5ft 8in',
  '5ft 9in',
  '5ft 10in',
  '5ft 11in',
  '6ft',
  '6ft 1in',
  '6ft 2in',
  '6ft 3in',
  '6ft 4in',
  '6ft 5in',
  '6ft 6in',
  '6ft 7in',
  '6ft 8in',
  '6ft 9in',
  '6ft 10in',
  '6ft 11in',
  '7ft',
  'Above 7ft',
]

const complexionOptions = ['Fair', 'Wheatish', 'Wheatish-Fair', 'Wheatish-Dark', 'Dark', 'Other']

const educationOptions = [
  'No Education',
  'Primary School',
  'High School',
  'Higher Secondary',
  'Diploma',
  'Under Graduate',
  'Post Graduate',
  'Ph.D.',
  'Other'
]

const weightOptions = [
  'Less than 40kg',
  '40-45kg',
  '45-50kg',
  '50-55kg',
  '55-60kg',
  '60-65kg',
  '65-70kg',
  '70-75kg',
  '75-80kg',
  '80-85kg',
  '85-90kg',
  '90-95kg',
  '95-100kg',
  '100-110kg',
  '110-120kg',
  'Above 120kg'
]

const jobTypeOptions = [
  'Self Employed',
  'Government Service',
  'Private Service',
  'Business',
  'Student',
  'Home Maker',
  'Other',
]

const stateOptions = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Other',
]

export const fieldSelectOptions: Record<string, string[]> = {
  gender: ['Male', 'Female', 'Other'],
  profileCreatedFor: ['Sister', 'Brother', 'Son', 'Daughter', 'Relative', 'Friend', 'Other'],
  martialStatus: ['Single', 'Married', 'Divorced', 'Widowed', 'Annulled', 'Other'],
  education: educationOptions,
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
  fatherOccupation: jobTypeOptions.filter(job => job !== 'Student'),
  motherOccupation: jobTypeOptions.filter(job => job !== 'Student'),
  familyType: ['Nuclear', 'Joint', 'Extended', 'Other'],
  areYouSaved: ['Yes', 'No'],
  areYouBaptized: ['Yes', 'No'],
  areYouAnointed: ['Yes', 'No'],
  denomination: ['Pentecostal', 'Catholic', 'Protestant', 'Orthodox', 'Other'],
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
      'currentAddress',
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
      dateOfBirth: Yup.date().required('Date of Birth is required'),
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
      currentAddress: Yup.object().shape({
        street: Yup.string().required('Street is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string()
          .oneOf(fieldSelectOptions.state, 'Invalid state')
          .required('State is required'),
        pincode: Yup.string().required('Pincode is required'),
      }),
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
      fatherOccupation: Yup.string()
        .oneOf(fieldSelectOptions.fatherOccupation, 'Invalid father occupation')
        .required("Father's Occupation is required"),
      motherName: Yup.string().required("Mother's Name is required"),
      motherOccupation: Yup.string()
        .oneOf(fieldSelectOptions.motherOccupation, 'Invalid mother occupation')
        .required("Mother's Occupation is required"),
      familyType: Yup.string()
        .oneOf(fieldSelectOptions.familyType, 'Invalid family type')
        .required('Family Type is required'),
      youngerBrothers: Yup.number().min(0).required('Required'),
      youngerSisters: Yup.number().min(0).required('Required'),
      elderBrothers: Yup.number().min(0).required('Required'),
      elderSisters: Yup.number().min(0).required('Required'),
      youngerBrothersMarried: Yup.number().min(0).required('Required'),
      youngerSistersMarried: Yup.number().min(0).required('Required'),
      elderBrothersMarried: Yup.number().min(0).required('Required'),
      elderSistersMarried: Yup.number().min(0).required('Required'),
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
      exMinAge: Yup.number().min(18).required('Minimum Age is required'),
      exMaxAge: Yup.number().min(18).required('Maximum Age is required'),
      exEducation: Yup.string().required('Education is required'),
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
      profilePictureIndex: Yup.number(),
    }),
  },
  payment: {
    title: 'Payment',
    fields: [],
    validationSchema: Yup.object().shape({}),
  },
}

export const PROFILE_SECTIONS_ORDER = ['personal', 'family', 'spiritual', 'preferences', 'images', 'payment'] as const
export type ProfileSectionKey = typeof PROFILE_SECTIONS_ORDER[number]

// Text fields that require admin verification when updated
export const TEXT_FIELDS_REQUIRING_VERIFICATION = [
  'name',
  'about',
  'jobTitle',
  'fatherName',
  'motherName',
  'churchName',
  'pastorName',
  'exOtherDetails'
] 