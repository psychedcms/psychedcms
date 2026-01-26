<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PageRepository;
use Doctrine\ORM\Mapping as ORM;
use PsychedCms\Core\Attribute\ContentType;
use PsychedCms\Core\Attribute\Field\HtmlField;
use PsychedCms\Core\Attribute\Field\TextField;
use PsychedCms\Core\Attribute\Field\TextareaField;
use PsychedCms\Core\Content\ContentInterface;
use PsychedCms\Core\Content\ContentTrait;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PageRepository::class)]
#[ORM\Table(name: 'pages')]
#[ORM\Index(columns: ['status'], name: 'idx_pages_status')]
#[ORM\Index(columns: ['author_id'], name: 'idx_pages_author_id')]
#[ApiResource(mercure: true)]
#[ContentType(icon: 'Description')]
class Page implements ContentInterface
{
    use ContentTrait;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[TextField(label: 'Title', required: true, group: 'content')]
    private ?string $title = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[HtmlField(label: 'Content', group: 'content')]
    private ?string $content = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[TextField(label: 'Meta Title', group: 'seo')]
    private ?string $metaTitle = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[TextareaField(label: 'Meta Description', group: 'seo')]
    private ?string $metaDescription = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $author = null;

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
}
