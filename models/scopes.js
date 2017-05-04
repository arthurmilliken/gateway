module.exports = {
  '*': {
    description: 'Root privilege can do anything in the system.'
  },
  'user': {
    description: 'Ability to edit or delete own user information.',
  },
  'user:admin': {
    description: 'Ability to edit or delete any user.',
  },
  'application': {
    description: 'Ability to create, edit or delete own applications.',
  },
  'application:admin': {
    description: 'Ability to find, create, edit or delete any application.',
  },
  'token': {
    description: 'Ability to find, create and revoke own tokens.',
  },
  'token:admin': {
    description: 'Ability to create, edit or delete any token.',
  },
  'resource': {
    description: 'Ability to find, create, edit or delete own resources.',
  },
  'resource:admin': {
    description: 'Ability to find, create, edit or delete any resources.',
  },
  'ipfs': {
    description: 'permission to use ipfs gateway and api.',
  },
};