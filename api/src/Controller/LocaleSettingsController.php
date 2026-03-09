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

    /** @var list<string> */
    private readonly array $supportedLocales;

    public function __construct(
        private readonly SettingRepository $settingRepository,
        string $appLocales,
        private readonly string $envDefaultLocale,
    ) {
        $this->supportedLocales = explode('|', $appLocales);
    }

    #[Route('/api/locale-settings', name: 'api_locale_settings_get', methods: ['GET'])]
    public function get(): JsonResponse
    {
        return new JsonResponse([
            'defaultLocale' => $this->getDefaultLocale(),
            'supportedLocales' => $this->supportedLocales,
        ]);
    }

    #[Route('/api/locale-settings', name: 'api_locale_settings_put', methods: ['PUT'])]
    public function put(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || !isset($data['defaultLocale']) || !is_string($data['defaultLocale'])) {
            return new JsonResponse(['error' => 'Invalid request'], Response::HTTP_BAD_REQUEST);
        }

        $defaultLocale = strtolower($data['defaultLocale']);

        if (!in_array($defaultLocale, $this->supportedLocales, true)) {
            return new JsonResponse(
                ['error' => 'Default locale must be one of the supported locales'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $this->settingRepository->set(self::KEY_DEFAULT_LOCALE, $defaultLocale);

        return new JsonResponse([
            'defaultLocale' => $defaultLocale,
            'supportedLocales' => $this->supportedLocales,
        ]);
    }

    private function getDefaultLocale(): string
    {
        return $this->settingRepository->get(self::KEY_DEFAULT_LOCALE) ?? $this->envDefaultLocale;
    }
}
