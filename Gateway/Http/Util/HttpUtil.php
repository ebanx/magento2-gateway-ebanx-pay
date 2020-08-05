<?php

namespace DigitalHub\Ebanx\Gateway\Http\Util;

use Magento\Framework\App\ObjectManager;

class HttpUtil
{
    public static function setupEbanxClient($config, $credit_card_config)
    {
        $ebanx_client = is_null($credit_card_config)
            ? EBANX($config)
            : EBANX($config, $credit_card_config);
        //$ebanx_client->setSource('Magento2', self::getEbanxVersion());

        return $ebanx_client;
    }

    public static function getRequestScheme()
    {
        $storeManager = ObjectManager::getInstance()->get('\Magento\Store\Model\StoreManagerInterface');

        if (isset($_SERVER['HTTPS'])) {
            if ('on' == strtolower($_SERVER['HTTPS'])) {
                return 'https';
            }
            if ('1' == $_SERVER['HTTPS']) {
                return 'https';
            }
        } elseif (isset($_SERVER['SERVER_PORT']) && ('443' == $_SERVER['SERVER_PORT'])) {
            return 'https';
        } elseif ($storeManager->getStore()->isCurrentlySecure()) {
            return 'https';
        }
        return 'http';
    }

    private static function getEbanxVersion()
    {
        $object_manager = ObjectManager::getInstance();
        $module_list = $object_manager->get('Magento\Framework\Module\ModuleListInterface');
        $module_info = $module_list->getOne('DigitalHub_Ebanx');
        return $module_info['setup_version'];
    }
}
