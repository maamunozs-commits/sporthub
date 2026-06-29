import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores personalizados reutilizables para los formularios reactivos.
 *
 * Centralizan las reglas de negocio de validación (contraseña segura,
 * teléfono chileno y confirmación de contraseña) para no repetirlas en
 * cada componente.
 */

/**
 * Valida que una contraseña cumpla **4 reglas de seguridad**:
 * 1. Longitud mínima de 8 caracteres.
 * 2. Al menos una letra mayúscula.
 * 3. Al menos un número.
 * 4. Al menos un carácter especial.
 *
 * @returns `null` si es válida, o un objeto `{ passwordSeguro: { errores } }`.
 */
export function passwordSeguroValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value || '';
    if (!valor) return null; // 'required' se encarga del campo vacío

    const errores: string[] = [];
    if (valor.length < 8) errores.push('mínimo 8 caracteres');
    if (!/[A-Z]/.test(valor)) errores.push('una mayúscula');
    if (!/[0-9]/.test(valor)) errores.push('un número');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(valor)) errores.push('un carácter especial');

    return errores.length ? { passwordSeguro: { errores } } : null;
  };
}

/**
 * Valida un teléfono: solo dígitos, entre 8 y 12 (ignora espacios, + y -).
 */
export function telefonoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value || '';
    if (!valor) return null;
    const limpio = valor.replace(/[\s\-+]/g, '');
    return /^[0-9]{8,12}$/.test(limpio) ? null : { telefono: true };
  };
}

/**
 * Validador de grupo: comprueba que dos campos (p. ej. contraseña y su
 * confirmación) coincidan.
 *
 * @param campo nombre del control principal
 * @param confirmacion nombre del control de confirmación
 */
export function camposIgualesValidator(campo: string, confirmacion: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = group.get(campo)?.value;
    const b = group.get(confirmacion)?.value;
    if (!b) return null;
    return a === b ? null : { noCoinciden: true };
  };
}
