<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260309112742 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE posts ADD featured_image_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE posts ADD CONSTRAINT FK_885DBAFA3569D950 FOREIGN KEY (featured_image_id) REFERENCES media (id) NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_885DBAFA3569D950 ON posts (featured_image_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE posts DROP CONSTRAINT FK_885DBAFA3569D950');
        $this->addSql('DROP INDEX IDX_885DBAFA3569D950');
        $this->addSql('ALTER TABLE posts DROP featured_image_id');
    }
}
