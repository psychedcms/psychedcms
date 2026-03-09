<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Translatable\Entity\MappedSuperclass\AbstractPersonalTranslation;

#[ORM\Entity]
#[ORM\Table(name: 'post_translations')]
#[ORM\UniqueConstraint(name: 'post_translation_unique_idx', columns: ['locale', 'object_id', 'field'])]
class PostTranslation extends AbstractPersonalTranslation
{
    #[ORM\ManyToOne(targetEntity: Post::class, inversedBy: 'translations')]
    #[ORM\JoinColumn(name: 'object_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    protected $object;

    public function __construct(?string $locale = null, ?string $field = null, ?string $value = null)
    {
        $this->setLocale($locale ?? '');
        $this->setField($field ?? '');
        $this->setContent($value ?? '');
    }
}
