/// <reference types="cypress" />

describe('Flujo principal de usuario', () => {
  it('Carga la página de inicio y muestra el feed', () => {
    cy.visit('/');
    cy.contains(/feed/i);
  });

  it('Navega a mensajes y muestra el prompt de selección', () => {
    cy.visit('/messages');
    cy.contains('Selecciona una conversación');
  });
});
