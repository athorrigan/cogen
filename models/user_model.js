let
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt')
;

const SALT_WORK_FACTOR = 10;


// Mongoose schema for User objects.
let userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// We need to encrypt the password before saving to the database.
userSchema.pre('save', function(next) {
    let user = this;

    // If password hasn't been modified, we punt it because we don't want to hash it again.
    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }

            user.password = hash;
            next();
        });
    });
});

module.exports = mongoose.model('User', userSchema);