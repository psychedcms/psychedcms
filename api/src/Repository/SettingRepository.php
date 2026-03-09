<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Setting;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Setting>
 */
class SettingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Setting::class);
    }

    public function get(string $key): ?string
    {
        $setting = $this->findOneBy(['key' => $key]);

        return $setting?->getValue();
    }

    public function set(string $key, ?string $value): void
    {
        $setting = $this->findOneBy(['key' => $key]);

        if ($setting === null) {
            $setting = new Setting($key, $value);
            $this->getEntityManager()->persist($setting);
        } else {
            $setting->setValue($value);
        }

        $this->getEntityManager()->flush();
    }
}
