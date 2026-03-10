<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\PageRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use PsychedCms\Core\Attribute\ContentType;
use PsychedCms\Core\Attribute\Field\HtmlField;
use PsychedCms\Core\Attribute\Field\TextField;
use PsychedCms\Core\Attribute\Field\TextareaField;
use PsychedCms\Core\Attribute\Field\RelationField;
use PsychedCms\Core\Content\ContentTrait;
use PsychedCms\Core\Content\TranslatableInterface;
use PsychedCms\Core\Content\TranslatableTrait;
use PsychedCms\Workflow\Content\PublicationWorkflowAwareInterface;
use PsychedCms\Workflow\Content\PublicationWorkflowTrait;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PageRepository::class)]
#[ORM\Table(name: 'pages')]
#[ORM\Index(columns: ['status'], name: 'idx_pages_status')]
#[ORM\Index(columns: ['author_id'], name: 'idx_pages_author_id')]
#[ApiResource(mercure: true)]
#[ContentType(icon: 'Description', locales: ['en', 'fr'])]
#[Gedmo\TranslationEntity(class: PageTranslation::class)]
class Page implements PublicationWorkflowAwareInterface, TranslatableInterface
{
    use ContentTrait;
    use PublicationWorkflowTrait;
    use TranslatableTrait;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Gedmo\Translatable]
    #[TextField(label: 'Title', required: true, group: 'content', translatable: true)]
    private ?string $title = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Gedmo\Translatable]
    #[HtmlField(label: 'Content', group: 'content', translatable: true)]
    private ?string $content = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Gedmo\Translatable]
    #[TextField(label: 'Meta Title', group: 'seo', translatable: true)]
    private ?string $metaTitle = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Gedmo\Translatable]
    #[TextareaField(label: 'Meta Description', group: 'seo', translatable: true)]
    private ?string $metaDescription = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[RelationField(reference: 'users', displayField: 'email', label: 'Author', group: 'sidebar')]
    private ?User $author = null;

    /** @var Collection<int, PageTranslation> */
    #[ORM\OneToMany(targetEntity: PageTranslation::class, mappedBy: 'object', cascade: ['persist', 'remove'])]
    #[ApiProperty(readable: false, writable: false)]
    private Collection $translations;

    public function __construct()
    {
        $this->translations = new ArrayCollection();
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getMetaTitle(): ?string
    {
        return $this->metaTitle;
    }

    public function setMetaTitle(?string $metaTitle): static
    {
        $this->metaTitle = $metaTitle;

        return $this;
    }

    public function getMetaDescription(): ?string
    {
        return $this->metaDescription;
    }

    public function setMetaDescription(?string $metaDescription): static
    {
        $this->metaDescription = $metaDescription;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;

        return $this;
    }

    /**
     * @return Collection<int, PageTranslation>
     */
    public function getTranslations(): Collection
    {
        return $this->translations;
    }
}
