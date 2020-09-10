define(
  [
      'jquery',
  ],
  function ($) {
      'use strict';
      return function (credit_card_number_element) {
          let brandPatterns = [
              { brand: 'visa', pattern: /^4/ },
              { brand: 'mastercard', pattern: /^(5[1-5]|677189)|^(222[1-9]|2[3-6]\d{2}|27[0-1]\d|2720)/ },
              { brand: 'amex', pattern: /^3[47]/ },
              { brand: 'diners', pattern: /^(36|38|30[0-5])/ },
              { brand: 'discover', pattern: /^(6011|65|64[4-9]|622)/ },
              { brand: 'elo', pattern: /^(4011|438935|45(1416|76|7393)|50(4175|6699|67|90[4-7])|63(6297|6368))/ },
              { brand: 'hipercard', pattern: /^(606282\d{10}(\d{3})?)|(3841\d{15})/ },
          ];

          let globalConfig = window.checkoutConfig.payment.digitalhub_ebanx_global;

          $(credit_card_number_element).keyup(function (event) {
              let value = event.target.value;
              if (value && value.length < 2 && value.length > 5) { return; }
              let brandItem = brandPatterns.find(item => item.pattern.test(value));
              let icon = `cc_brand_${(brandItem ? brandItem.brand : 'generic')}`;
              $('.credit-card-brand-icon').attr('src', globalConfig[icon])
          });
      };
  }
);
