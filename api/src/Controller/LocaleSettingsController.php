<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\SettingRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;

#[AsController]
class LocaleSettingsController
{
    public const KEY_DEFAULT_LOCALE = 'default_locale';
    public const KEY_SUPPORTED_LOCALES = 'supported_locales';

    /** @var list<string> */
    private readonly array $envSupportedLocales;

    public function __construct(
        private readonly SettingRepository $settingRepository,
        string $appLocales,
        private readonly string $envDefaultLocale,
    ) {
        $this->envSupportedLocales = explode('|', $appLocales);
    }

    #[Route('/api/locale-settings', name: 'api_locale_settings_get', methods: ['GET'])]
    public function get(): JsonResponse
    {
        return new JsonResponse([
            'defaultLocale' => $this->getDefaultLocale(),
            'supportedLocales' => $this->getSupportedLocales(),
        ]);
    }

    #[Route('/api/locale-settings', name: 'api_locale_settings_put', methods: ['PUT'])]
    public function put(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return new JsonResponse(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        if (isset($data['supportedLocales']) && is_array($data['supportedLocales'])) {
            $locales = array_filter($data['supportedLocales'], 'is_string');
            $locales = array_map('strtolower', $locales);
            $locales = array_values(array_unique($locales));

            if (count($locales) > 0) {
                $this->settingRepository->set(self::KEY_SUPPORTED_LOCALES, implode('|', $locales));
            }
        }

        // Reload supported locales after potential update
        $supportedLocales = $this->getSupportedLocales();

        if (isset($data['defaultLocale']) && is_string($data['defaultLocale'])) {
            $defaultLocale = strtolower($data['defaultLocale']);

            if (in_array($defaultLocale, $supportedLocales, true)) {
                $this->settingRepository->set(self::KEY_DEFAULT_LOCALE, $defaultLocale);
            } else {
                return new JsonResponse(
                    ['error' => 'Default locale must be one of the supported locales'],
                    Response::HTTP_BAD_REQUEST,
                );
            }
        }

        return new JsonResponse([
            'defaultLocale' => $this->getDefaultLocale(),
            'supportedLocales' => $this->getSupportedLocales(),
        ]);
    }

    private function getDefaultLocale(): string
    {
        return $this->settingRepository->get(self::KEY_DEFAULT_LOCALE) ?? $this->envDefaultLocale;
    }

    /**
     * @return list<string>
     */
    private function getSupportedLocales(): array
    {
        $dbValue = $this->settingRepository->get(self::KEY_SUPPORTED_LOCALES);

        if ($dbValue !== null) {
            return explode('|', $dbValue);
        }

        return $this->envSupportedLocales;
    }
}
