<?php

return [
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    ApiPlatform\Symfony\Bundle\ApiPlatformBundle::class => ['all' => true],
    Doctrine\Bundle\DoctrineBundle\DoctrineBundle::class => ['all' => true],
    Doctrine\Bundle\MigrationsBundle\DoctrineMigrationsBundle::class => ['all' => true],
    Nelmio\CorsBundle\NelmioCorsBundle::class => ['all' => true],
    Symfony\Bundle\MercureBundle\MercureBundle::class => ['all' => true],
    Stof\DoctrineExtensionsBundle\StofDoctrineExtensionsBundle::class => ['all' => true],
    PsychedCms\Calendar\PsychedCmsCalendarBundle::class => ['all' => true],
    PsychedCms\Media\PsychedCmsMediaBundle::class => ['all' => true],
    PsychedCms\Taxonomy\PsychedCmsTaxonomyBundle::class => ['all' => true],
    PsychedCms\Workflow\PsychedCmsWorkflowBundle::class => ['all' => true],
    PsychedCms\Translatable\PsychedCmsTranslatableBundle::class => ['all' => true],
    Doctrine\Bundle\FixturesBundle\DoctrineFixturesBundle::class => ['dev' => true, 'test' => true],
    League\FlysystemBundle\FlysystemBundle::class => ['all' => true],
    PsychedCms\Search\PsychedCmsSearchBundle::class => ['all' => true],
];
