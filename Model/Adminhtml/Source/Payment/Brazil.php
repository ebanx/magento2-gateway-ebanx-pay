<?php
namespace DigitalHub\Ebanx\Model\Adminhtml\Source\Payment;

class Brazil implements \Magento\Framework\Option\ArrayInterface
{
    /**
     * {@inheritdoc}
     */
    public function toOptionArray()
    {
        return [
            [
                'value' => 'creditcard',
                'label' => __('Cartão de Crédito')
            ],
            [
                'value' => 'boleto',
                'label' => __('Boleto Bancário')
            ],
        ];
    }
}
