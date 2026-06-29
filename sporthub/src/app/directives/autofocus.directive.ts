import { AfterViewInit, Directive, ElementRef } from '@angular/core';

/**
 * Directiva de atributo que coloca el foco automáticamente en el elemento
 * que la declara una vez que la vista se ha inicializado.
 *
 * Uso: `<input appAutofocus>` — útil en el primer campo de un formulario.
 */
@Directive({ selector: '[appAutofocus]', standalone: false })
export class AutofocusDirective implements AfterViewInit {
  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    // Pequeño retraso para asegurar el render del input.
    setTimeout(() => this.el.nativeElement.focus(), 0);
  }
}
