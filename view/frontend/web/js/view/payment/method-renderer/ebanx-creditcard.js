/*browser:true*/
/*global define*/
define(
    [
        'Magento_Checkout/js/view/payment/default',
        'jquery',
        'lib-js',
        'document-mask',
        'Magento_Checkout/js/model/quote',
        'mage/url',
        'cc-br',
    ],
    function (Component, $, EBANX, documentMask, quote, url, cc) {
        'use strict';

        window.EBANX = EBANX;

        return Component.extend({
            defaults: {
                template: 'Ebanx_Payments/payment/ebanx_creditcard_br',
                brand: null,
                cvv: null,
                instalments: 1,
                number: null,
                expiry: null,
                token: null,
                paymentDocument: window.checkoutConfig.payment.ebanx.customerDocument,
                total: null,
                mode: window.checkoutConfig.payment.ebanx.mode,
            },
            initialize: function () {
                this._super();
                documentMask('#ebanx_creditcard_document');
                var totals = quote.getTotals();
                totals.subscribe(this.onUpdateTotals, this);
                this.onUpdateTotals(totals.peek());
            },
            getData: function () {
                return {
                    method: this.getCode(),
                    additional_data: {
                        brand: this.brand,
                        cvv: this.cvv,
                        instalments: this.instalments,
                        token: this.token,
                        document: this.paymentDocument,
                    }
                };
            },
            onUpdateTotals: function (totals) {
                this.total = totals.grand_total;
                var self = this;
                $.post(
                    url.build('ebanx/payment/instalmentterms'),
                    {
                        country: 'Brazil',
                        amount: this.total
                    },
                    'json'
                ).done(function (response) {
                    self.updatePaymentTerms(response);
                });
            },
            updatePaymentTerms: function (paymentTerms) {
                cc.createInstalment(paymentTerms);
            },
            setCardData: function (data) {
                this.brand = data.payment_type_code;
                this.token = data.token;

                this.placeOrder();
            },
            setDocument: function (paymentDocument) {
                this.paymentDocument = paymentDocument;
            },
            beforePlaceOrder: function (data) {
                this.disableBtnPlaceOrder();
                if (!this.validateForm('#card-form')) {
                    this.enableBtnPlaceOrder();
                    return null;
                }
                this.setDocument(data.paymentDocument);
                this.instalments = data.instalments;

                this.tokenizer({
                    card_number: data.number.replace(/ /g, ''),
                    card_due_date: this.formatDueDate(data.expiry),
                    card_cvv: data.cvv,
                });
            },
            tokenizer: function (param) {
                EBANX.config.setMode(this.mode);
                EBANX.config.setPublishableKey(window.checkoutConfig.payment.ebanx.publicKey);
                EBANX.config.setCountry('br');

                var createTokenCallback = function (ebanxResponse) {
                    this.enableBtnPlaceOrder();
                    if (ebanxResponse.data.hasOwnProperty('status')) {
                        this.setCardData(ebanxResponse.data);
                    } else {
                        var errorMessage =
                            ebanxResponse.error.err.status_message ||
                            ebanxResponse.error.err.message;
                        this.showErrorMessage(errorMessage);
                    }
                }.bind(this);

                EBANX.card.createToken(
                    {
                        card_number: param.card_number,
                        card_name: 'Magento Credit Card',
                        card_due_date: param.card_due_date,
                        card_cvv: param.card_cvv,
                    },
                    createTokenCallback
                );
            },
            validateForm: function (form) {
                return $(form).validation() && $(form).validation('isValid');
            },
            formatDueDate: function(expiry){
                const dueDateSplited = expiry.replace(/ /g, '').split('/');
                const dueDate = dueDateSplited[0] + '/20' +  dueDateSplited[1];
                return dueDate;
            },
            showErrorMessage: function(errorMessage){
                alert({
                    title: 'Atenção:',
                    content: errorMessage,
                    actions: {
                        always: function(){}
                    }
                });
            },
            disableBtnPlaceOrder: function(){
                $('#btn_cc_br_form_place_order').attr('disabled', 'disabled');
            },
            enableBtnPlaceOrder: function(){
                $('#btn_cc_br_form_place_order').removeAttr('disabled');
            }
        });
    }
);