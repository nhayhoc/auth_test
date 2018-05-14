var validate = require('mongoose-validator');

exports.emailValidator = validate({
    validator: 'isEmail',
    passIfEmpty: true,
    message: 'Please fill a valid email address.',
});

exports.pwdValidator = validate({
    passIfEmpty: true,
    validator: 'matches',
    arguments: /(?=[^\d\n]*\d)(?=[^A-Z\n]*[A-Z])(?=[^a-z\n]*[a-z])^[A-Za-z0-9]{8,}$/m,
    message: 'The password must be eight characters including one uppercase letter and alphanumeric characters.'
});

exports.first_lastName = validate({
    validator: 'matches',
    arguments: /^[a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]{2,40}$/u,
    passIfEmpty: true,
    message: 'Please fill a valid {PATH}.'
})