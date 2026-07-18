export function validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName} es requerido`;
    }
    return null;
}

export function validateMaxLength(value, fieldName, max) {
    if (value && typeof value === 'string' && value.length > max) {
        return `${fieldName} no puede exceder ${max} caracteres`;
    }
    return null;
}

export function validateNumeric(value, fieldName) {
    if (value !== '' && value !== null && value !== undefined) {
        const num = Number(value);
        if (isNaN(num)) {
            return `${fieldName} debe ser un número válido`;
        }
    }
    return null;
}

export function validateRange(value, fieldName, min, max) {
    if (value !== '' && value !== null && value !== undefined) {
        const num = Number(value);
        if (!isNaN(num) && (num < min || num > max)) {
            return `${fieldName} debe estar entre ${min} y ${max}`;
        }
    }
    return null;
}

export function validateForm(rules) {
    const errors = {};
    let isValid = true;

    for (const rule of rules) {
        const { field, value, validations } = rule;
        for (const v of validations) {
            const error = v.fn(value, v.fieldName || field, ...v.args);
            if (error) {
                errors[field] = error;
                isValid = false;
                break;
            }
        }
    }

    return { isValid, errors };
}
