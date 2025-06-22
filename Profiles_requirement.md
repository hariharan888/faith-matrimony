Create a Profile data modal and every User should have one profile associated with them. Create a /my-profile page which should be navigated first after user-creation. User should not be able to view dashboard unless they have done the initial creation of profile. 

Add columns to User model as isVerified with default false which an admin will set to true after verifying the profile in the backend.

Also create ProfileImage data modal which a profile can have multiple images and there is one boolean column isPrimary which is true for one image and false for others. The image column has data column where image is saved as base64, so have max length available for that column. Also add an order column which has number for those images which can be used to sort, reorder images.

/my-profile page
This page  shows a completion progress bar and split the profile details into multiple steps and gets all required fields and update to profiles data in database and move to next section.

Structure the Utils, sections, components, pages, apis based on how you seem fit.
The main idea of this app is that I should be able to create/edit my profile and I should be able to see other profiles and give them requests and interact with them.

This page has two modes. Use like a stepper component. Each section has a formview and preview view where finished sections can have preview view as default.
- New Profile mode: User should not be able to navigate to other pages in this mode. Section wise navigation requires step-by-step navigation and section wise validation and cant see next section unless all previous sections are completed. Each section submit should save to db. So that, When user finishes few sections, closes browser, reopens website, the next unfinished section should come automatically.
- Update mode. User can navigate to other pages in this mode. This is when user later wants to update details of their profile. User can also visit any section without restriction as they have already submitted the profile.

The sections are
  - Personal Details
  - Family Details
  - Spiritual Details
  - Preferences
  - Photos
  - Payment

The following fields, schema and data are required. Refactor the fields schema and options as needed. Most of these fields should be dropdown options and can use n+ kind of options or 'other' as an option as shown below in examples if possible, when options go beyond a controlled limit. For eg., no of brothers should have options 0 to 10, and 10+ as an additional option, given we dont care the exact number more than 10. same for salary, like 'above 50L', so that we can have lot of options below that, but above 50L, we dont need a definite number.

Use dropdowns for fields as much as possible and only few text fields like name, about. Because we dont want any user to later enter any identifiable contact details within text fields. By allowing only dropdowns, we eliminate the necessary to validate lot of fields.

Creation of profile will go through a full verification by admin. But later when user updates his profile, we need to keep the updated versions in a new data model called FieldUpdates where it has which profile it is associated to, field name, field value. When user later updates his profile using update mode of my-profile tab, any non-dropdown text fields like name and about and exOtherDetails, etc would be saved only in this FieldUpdate models and not directly in Profiles model and where admin can later verify these text fields manually and update them to the profiles table. When querying profiles, if it is my profile, I would get the updated value from FieldUpdates model and when querying other profiles, I will always see what is in the profiles table. So that users can't see unverified text fields.

Schema

  personal: {
    fields: [
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
      name: Yup.string().required('Name is required'),
      gender: Yup.string()
        .oneOf(fieldSelectOptions.gender, 'Invalid gender')
        .required('Gender is required'),
      dateOfBirth: Yup.date().required('Date of Birth is required'),
      martialStatus: Yup.string()
        .oneOf(fieldSelectOptions.martialStatus, 'Invalid martial status')
        .required('Martial Status is required'),
      education: Yup.string().required('Education is required'),
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
      weight: Yup.string().required('Weight is required'),
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
      youngerBrothersMarried: Yup.number()
        .min(0)
        .max(Yup.ref('youngerBrothers'), 'Should be less than or equal to total count')
        .required('Required'),
      youngerSistersMarried: Yup.number()
        .min(0)
        .max(Yup.ref('youngerSisters'), 'Should be less than or equal to total count')
        .required('Required'),
      elderBrothersMarried: Yup.number()
        .min(0)
        .max(Yup.ref('elderBrothers'), 'Should be less than or equal to total count')
        .required('Required'),
      elderSistersMarried: Yup.number()
        .min(0)
        .max(Yup.ref('elderSisters'), 'Should be less than or equal to total count')
        .required('Required'),
    }),
  },
  spiritual: {
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
        .required('Gallery is required'),
      profilePictureIndex: Yup.number(),
    }),
  },

The fields needed in db are as follows

  // db fields. Not in the profile form.
  createdAt: Date;
  updatedAt: Date;
  isReady: boolean; // this is set to true when all sections are completed and admin has to verify the profile.

  // Personal Details
  name: string;
  about: string // text area where user can fill a long text about them, their family and any other views
  gender: string;
  dateOfBirth: string; // validation of format YYYY-MM-DD
  martialStatus: string; // enum of spinster/bachelor, widow/widower, annulled should be option available based on gender selected
  education: string;
  jobType: string;
  jobTitle: string;
  income: string;
  height: string;
  weight: string;
  complexion: string;
  mobileNumber: string;
  currentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  nativePlace: string;
  motherTongue: string;

  // Family Details
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  familyType: string;
  youngerBrothers: number;
  youngerSisters: number;
  elderBrothers: number;
  elderSisters: number;
  youngerBrothersMarried: number;
  youngerSistersMarried: number;
  elderBrothersMarried: number;
  elderSistersMarried: number;

  // Spiritual Details
  areYouSaved: boolean;
  areYouBaptized: boolean;
  areYouAnointed: boolean;
  churchName: string;
  denomination: string;
  pastorName: string;
  pastorMobileNumber: string;
  churchAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  // Preferences
  exMinAge: number;
  exMaxAge: number;
  exEducation: string;
  exJobType: string;
  exIncome: string;
  exComplexion: string;
  exOtherDetails: string;





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
];
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
];
const complexionOptions = ['Fair', 'Wheatish', 'Wheatish-Fair', 'Wheatish-Dark', 'Dark', 'Other'];
const jobTypeOptions = [
  'Self Employed',
  'Government Service',
  'Private Service',
  'Business',
  'Student',
  'Home Maker',
  'Other',
];

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
];

export const fieldSelectOptions: Record<string, string[]> = {
  gender: ['Male', 'Female', 'Other'],
  martialStatus: ['Single', 'Married', 'Divorced', 'Widowed', 'Annulled', 'Other'],
  jobType: jobTypeOptions,
  income: incomeOptions,
  height: heightOptions,
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
  exJobType: ['Any', ...jobTypeOptions],
  exIncome: ['Any', ...incomeOptions],
  exComplexion: ['Any', ...complexionOptions],
  state: stateOptions,
};


Add one more field to profile table called 'profileCreatedFor'
where the options can be sister, brother, son. daughter, relative, friend, other.
Add it in personal details section and rename the section as Primary Details.

You can always use shadcn components and blocks in the implementation

Create the form sections and fill with fields for each section.
Have a sidebar within the form container that allows you to switch between sections with section title. Switching the sections should not be allowed in the new profile creation mode as already discussed. 
Each section should have a submit button which will update the profiles table or the FieldUpdates table based on which mode they are in and whether they are text fields as mentioned in the requirement file.
If the current section is edited, dont allow to move to next section without submitting the section. 
Split the sections and their validations into seperate file components for easy maintenance.
Move the progress bar within this sidebar.
