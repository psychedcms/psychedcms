<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Attribute\Route;

#[AsController]
class LocaleSettingsController
{
    /** @var list<string> */
    private readonly array $supportedLocales;

    public function __construct(
        string $appLocales,
        private readonly string $defaultLocale,
    ) {
        $this->supportedLocales = explode('|', $appLocales);
    }

    #[Route('/api/locale-settings', name: 'api_locale_settings', methods: ['GET'])]
    public function __invoke(): JsonResponse
    {
        return new JsonResponse([
            'defaultLocale' => $this->defaultLocale,
            'supportedLocales' => $this->supportedLocales,
        ]);
    }
}
