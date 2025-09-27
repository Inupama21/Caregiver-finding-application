import * as yup from 'yup';

export const caregiverSignupSchema = yup.object().shape({
  caregiverName: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  dateOfBirth: yup
    .string()
    .required('Date of birth is required')
    .test('valid-date', 'Please enter a valid date', (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('age-check', 'You must be at least 18 years old', (value) => {
      if (!value) return false;
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    }),
  
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits'),
  
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  district: yup
    .string()
    .required('District is required')
    .min(2, 'District must be at least 2 characters')
    .max(50, 'District must be less than 50 characters'),
  
  nic: yup
    .string()
    .required('NIC number is required')
    .matches(/^[0-9]{9}[vVxX]?$|^[0-9]{12}$/, 'Please enter a valid NIC number')
    .test('nic-format', 'NIC format is invalid', (value) => {
      if (!value) return false;
      // Old format: 9 digits + V/X
      if (value.length === 10) {
        return /^[0-9]{9}[vVxX]$/.test(value);
      }
      // New format: 12 digits
      if (value.length === 12) {
        return /^[0-9]{12}$/.test(value);
      }
      return false;
    }),
  
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
  
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
  
  idPhoto: yup
    .string()
    .required('ID photo is required'),
  
  caregiverPhoto: yup
    .string()
    .required('Caregiver photo is required'),
});

export type CaregiverSignupFormData = yup.InferType<typeof caregiverSignupSchema>;
