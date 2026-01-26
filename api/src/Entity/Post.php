<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PostRepository;
use Doctrine\ORM\Mapping as ORM;
use PsychedCms\Core\Attribute\ContentType;
use PsychedCms\Core\Attribute\Field\HtmlField;
use PsychedCms\Core\Attribute\Field\TextareaField;
use PsychedCms\Core\Attribute\Field\TextField;
use PsychedCms\Core\Content\ContentTrait;
use PsychedCms\Workflow\Content\PublicationWorkflowAwareInterface;
use PsychedCms\Workflow\Content\PublicationWorkflowTrait;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PostRepository::class)]
#[ORM\Table(name: 'posts')]
#[ORM\Index(columns: ['status'], name: 'idx_posts_status')]
#[ORM\Index(columns: ['author_id'], name: 'idx_posts_author_id')]
#[ApiResource(mercure: true)]
#[ContentType(icon: 'Article')]
class Post implements PublicationWorkflowAwareInterface
{
    use ContentTrait;
    use PublicationWorkflowTrait;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[TextField(label: 'Title', required: true, group: 'content')]
    private ?string $title = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[TextareaField(label: 'Excerpt', group: 'content')]
    private ?string $excerpt = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[HtmlField(label: 'Content', group: 'content')]
    private ?string $content = null;

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

    public function getExcerpt(): ?string
    {
        return $this->excerpt;
    }

    public function setExcerpt(?string $excerpt): static
    {
        $this->excerpt = $excerpt;

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
